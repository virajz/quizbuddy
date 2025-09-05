// /app/api/quiz/generate/route.ts
import "server-only";
import { NextRequest } from "next/server";
import { groq, MODEL_DEFAULT } from "@/lib/groq";
import { buildQuizPrompt } from "@/modules/quiz/utils/quiz.prompts";
import { quizGenerateRequestSchema, quizSchema, validateQuizBusinessRules } from "@/modules/quiz/validation";
import { logQuizEvent } from "@/lib/firebase.server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    let body: any;
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
        let parsedJSON: any;
        try { parsedJSON = JSON.parse(raw); } catch { parsedJSON = {}; }
        const candidate = parsedJSON?.quiz ?? parsedJSON;
        const quizData = {
            id: crypto.randomUUID(),
            topic: input.topic,
            level: input.level,
            locale: input.locale,
            createdAt: Date.now(),
            questions: Array.isArray(candidate?.questions) ? candidate.questions : [],
        };
        const valid = quizSchema.parse(quizData);
        validateQuizBusinessRules(valid);
        const response = { quiz: valid, metadata: { model: process.env.GROQ_MODEL_QUIZ ?? MODEL_DEFAULT, latencyMs } };
        // non-blocking log
        logQuizEvent({ type: "quiz_generated", topic: input.topic, level: input.level, locale: input.locale, latencyMs }).catch(() => { });
        return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(e?.message ?? "Generation failed", { status: 500 });
    }
}
