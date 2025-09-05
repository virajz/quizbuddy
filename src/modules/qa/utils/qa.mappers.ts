// /modules/qa/utils/qa.mappers.ts
import type { AskQuestionResponse } from "../types/qa.types";

export function toAskQuestionResponse(raw: string, meta: { latencyMs: number; model: string }): AskQuestionResponse {
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const answer = {
        text: parsed?.answer?.text ?? "I couldn't parse a valid answer.",
        keyTerms: Array.isArray(parsed?.answer?.keyTerms) ? parsed.answer.keyTerms : [],
        examples: Array.isArray(parsed?.answer?.examples) ? parsed.answer.examples : undefined,
        readingLevel: parsed?.answer?.readingLevel === "grade9-10" ? "grade9-10" : "grade6-8",
        cached: !!parsed?.answer?.cached,
    };

    return { answer, metadata: { latencyMs: meta.latencyMs, model: meta.model } };
}
