// /app/api/chat/route.ts
import "server-only";
import { NextRequest } from "next/server";
import { groq } from "@/lib/groq";
import type { ChatRequest, ChatStreamChunk } from "@/modules/chat/types/chat.types";
import { buildRollingContext } from "@/modules/chat/utils/chat.prompts";
import { logChatEvent } from "@/lib/firebase.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    let body: ChatRequest;
    try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
    if (!body?.messages || !Array.isArray(body.messages)) return new Response("Invalid body", { status: 400 });
    // Narrow message role type for Groq API
    type GroqChatMessage = { role: "system" | "user" | "assistant"; content: string };
    const prepared = buildRollingContext({ messages: body.messages.map(m => ({ role: m.role, content: m.content })) }) as GroqChatMessage[];

    const primaryModel = "llama-3.1-70b-versatile";
    const fallbacks = ["mixtral-8x7b-instruct", "llama-3.1-8b-instant"];

    interface StreamDelta { choices?: { delta?: { content?: string } }[] }
    async function attempt(model: string): Promise<AsyncIterable<StreamDelta>> {
        return groq.chat.completions.create({
            model,
            temperature: 0.3,
            top_p: 0.9,
            stream: true,
            messages: prepared,
        }) as unknown as AsyncIterable<StreamDelta>; // cast due to SDK stream typing
    }

    let streamIterator: AsyncIterable<StreamDelta> | null = null;
    let chosenModel = primaryModel;
    try {
        streamIterator = await attempt(primaryModel);
    } catch {
        for (const fb of fallbacks) {
            try { streamIterator = await attempt(fb); chosenModel = fb; break; } catch { }
        }
    }
    if (!streamIterator) {
        return new Response(JSON.stringify({ content: "", done: true, error: "Model error" }), { status: 200 });
    }
    // Logging (fire & forget)
    logChatEvent({ type: "chat_stream", model: chosenModel, sessionId: body.sessionId }).catch(() => { });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const chunk of streamIterator!) {
                    const token = chunk?.choices?.[0]?.delta?.content ?? "";
                    if (token) {
                        const payload: ChatStreamChunk = { content: token };
                        controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
                    }
                }
                controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true }) + "\n"));
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "stream failed";
                controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true, error: msg }) + "\n"));
            } finally { controller.close(); }
        }
    });
    return new Response(readable, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
}
