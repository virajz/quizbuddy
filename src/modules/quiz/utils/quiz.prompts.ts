// /modules/quiz/utils/quiz.prompts.ts
import "server-only";
import type { QuizGenerateRequest } from "../types/quiz.types";

export function buildQuizPrompt(req: QuizGenerateRequest) {
    const langName = req.locale === "hi" ? "Hindi" : req.locale === "gu" ? "Gujarati" : "English";
    return [
        `You are an expert quiz generator for ${langName} learners. Output ONLY valid JSON matching the schema described below.`,
        `Language: ${langName} (ALL content must be in ${langName}).`,
        `Learner level: ${req.level}. Use simpler wording for beginner; slightly deeper reasoning for intermediate.`,
        `Topic: ${req.topic}`,
        `Create exactly 5 multiple-choice questions (MCQs) covering: definition/recall, misconception check, simple application or calculation, scenario-based reasoning, and a varied style conceptual question.`,
        `Each question must have: id (short slug), stem, options (array of 4 each with id in [A,B,C,D] and text), correctOptionId, explanation (<=60 words teaching why correct and why others are wrong briefly), and optional tags (1-3 concise topical tags).`,
        `Rules:`,
        `- Exactly 4 distinct option texts per question.`,
        `- Exactly one correctOptionId.`,
        `- No duplicate stems; keep stems <= 180 chars.`,
        `- Option text <= 120 chars.`,
        `- No markdown formatting, no numbering outside JSON.`,
        `- Avoid phrases like 'Correct answer:' in explanation.`,
        `Schema (JSON object): { "quiz": { "topic": string, "level": "beginner"|"intermediate", "locale": "en"|"hi"|"gu", "questions": [ { "id": string, "stem": string, "options": [{"id":"A"|"B"|"C"|"D","text":string}], "correctOptionId":"A"|"B"|"C"|"D", "explanation": string, "tags"?: string[] } ] } }`,
        `Return ONLY JSON. Do not wrap in code fences.`,
        req.seed ? `Seed (for determinism hint): ${req.seed}` : undefined,
    ].filter(Boolean).join("\n");
}
