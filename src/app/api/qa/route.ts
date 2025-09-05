// /app/api/qa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { askQuestionSchema } from "@/lib/validators";
import { buildQAPrompt } from "@/modules/qa/utils/qa.prompts";
import { getTutorAnswer } from "@/lib/groq";
import { toAskQuestionResponse } from "@/modules/qa/utils/qa.mappers";
import { logQAServerEvent } from "@/lib/firebase.server";

export const runtime = "nodejs"; // predictable env for Groq SDK

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input = askQuestionSchema.parse(body);

        const prompt = buildQAPrompt(input);
        const { content, latencyMs, model } = await getTutorAnswer(prompt);
        const response = toAskQuestionResponse(content, { latencyMs, model });

        // fire-and-forget logging
        logQAServerEvent({ type: "answer_generated", latencyMs, model, qLen: input.question.length })
            .catch(() => { /* swallow logging errors */ });

        return NextResponse.json(response, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Invalid request or model error", details: err?.message ?? "unknown" },
            { status: 400 }
        );
    }
}
