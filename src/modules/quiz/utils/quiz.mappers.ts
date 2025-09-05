// /modules/quiz/utils/quiz.mappers.ts
import type { Quiz, QuizGenerateResponse, QuizOptionId } from "../types/quiz.types";
import { ZodIssue } from "zod";
import { quizSchema, validateQuizBusinessRules } from "../validation";

export function parseQuizJSON(raw: string): unknown {
    try { return JSON.parse(raw); } catch { return {}; }
}

export function toQuiz(raw: string, meta: { model: string; latencyMs: number }): QuizGenerateResponse {
    const parsed = parseQuizJSON(raw) as unknown;
    let candidate: unknown = parsed;
    if (parsed && typeof parsed === "object" && "quiz" in (parsed as Record<string, unknown>)) {
        const inner = (parsed as Record<string, unknown>).quiz;
        if (inner && typeof inner === "object") candidate = inner;
    }
    // candidate likely missing id/createdAt; we'll inject then validate
    const cObj: Record<string, unknown> = (candidate && typeof candidate === "object") ? candidate as Record<string, unknown> : {};
    const base: unknown = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        topic: typeof cObj.topic === "string" ? cObj.topic : "unknown",
        level: cObj.level === "intermediate" ? "intermediate" : "beginner",
        locale: cObj.locale === "hi" ? "hi" : cObj.locale === "gu" ? "gu" : "en",
        questions: Array.isArray(cObj.questions as unknown) ? cObj.questions : [],
    };
    const result = quizSchema.safeParse(base);
    if (!result.success) {
        const issues = result.error.issues.map((i: ZodIssue) => i.message).join("; ");
        throw new Error("Model output failed validation: " + issues);
    }
    const quiz = validateQuizBusinessRules(result.data);
    return { quiz, metadata: { model: meta.model, latencyMs: meta.latencyMs } };
}

export function grade(quiz: Quiz, answers: { questionId: string; selectedOptionId: QuizOptionId }[]) {
    const map = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));
    const breakdown = quiz.questions.map(q => {
        const selected = map.get(q.id);
        const correct = selected === q.correctOptionId;
        return { questionId: q.id, correct, correctOptionId: q.correctOptionId, explanation: q.explanation };
    });
    const score = breakdown.filter(b => b.correct).length;
    return { score, breakdown };
}
