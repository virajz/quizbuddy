// /app/api/quiz/generate/route.ts
import "server-only";
import { NextRequest } from "next/server";
import { groq, MODEL_DEFAULT } from "@/lib/groq";
import { buildQuizPrompt } from "@/modules/quiz/utils/quiz.prompts";
import { quizGenerateRequestSchema, quizSchema, validateQuizBusinessRules } from "@/modules/quiz/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    let body: unknown;
    try { body = await req.json(); } catch { return new Response("Invalid JSON body", { status: 400 }); }
    const parsed = quizGenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
        return new Response(parsed.error.issues.map((i) => i.message).join("; "), { status: 400 });
    }
    const input = parsed.data;
    const systemPrompt = buildQuizPrompt(input);
    const started = Date.now();
    try {
        const chat = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL_QUIZ ?? MODEL_DEFAULT,
            temperature: 0.4,
            max_tokens: 1200,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Return quiz JSON now." },
            ],
        });
        const latencyMs = Date.now() - started;
        const raw = chat.choices?.[0]?.message?.content ?? "{}";
        let parsedJSON: unknown;
        try { parsedJSON = JSON.parse(raw); } catch { parsedJSON = {}; }
        // candidate quiz wrapper if present
        let candidate: unknown = parsedJSON;
        if (parsedJSON && typeof parsedJSON === "object" && "quiz" in (parsedJSON as Record<string, unknown>)) {
            const inner = (parsedJSON as Record<string, unknown>).quiz;
            if (inner && typeof inner === "object") candidate = inner;
        }
        const quizData = {
            id: crypto.randomUUID(),
            topic: input.topic,
            level: input.level,
            locale: input.locale,
            createdAt: Date.now(),
            questions: Array.isArray((candidate as Record<string, unknown> | undefined)?.questions as unknown) ? (candidate as Record<string, unknown>).questions as unknown[] : [],
        };
        const valid = quizSchema.parse(quizData);
        validateQuizBusinessRules(valid);
        const response = { quiz: valid, metadata: { model: process.env.GROQ_MODEL_QUIZ ?? MODEL_DEFAULT, latencyMs } };
        return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Generation failed";
        return new Response(msg, { status: 500 });
    }
}
