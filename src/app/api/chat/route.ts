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
    const prepared = buildRollingContext({ messages: body.messages.map(m => ({ role: m.role, content: m.content })) });

    const primaryModel = "llama-3.1-70b-versatile";
    const fallbacks = ["mixtral-8x7b-instruct", "llama-3.1-8b-instant"];

    async function attempt(model: string) {
        return groq.chat.completions.create({
            model,
            temperature: 0.3,
            top_p: 0.9,
            stream: true,
            messages: prepared as any,
        });
    }

    let streamIterator: AsyncIterable<any> | null = null;
    let chosenModel = primaryModel;
    try {
        streamIterator = await attempt(primaryModel);
    } catch (e) {
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
                for await (const chunk of streamIterator as any) {
                    const token = chunk?.choices?.[0]?.delta?.content || "";
                    if (token) {
                        const payload: ChatStreamChunk = { content: token };
                        controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
                    }
                }
                controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true }) + "\n"));
            } catch (e: any) {
                controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true, error: e?.message || "stream failed" }) + "\n"));
            } finally { controller.close(); }
        }
    });
    return new Response(readable, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
}
