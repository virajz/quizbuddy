// /modules/quiz/utils/quiz.mappers.ts
import type { Quiz, QuizGenerateResponse, QuizOptionId, QuizQuestion } from "../types/quiz.types";
import { z, ZodIssue } from "zod";
import { quizSchema, validateQuizBusinessRules } from "../validation";

export function parseQuizJSON(raw: string): any {
    try { return JSON.parse(raw); } catch { return {}; }
}

export function toQuiz(raw: string, meta: { model: string; latencyMs: number }): QuizGenerateResponse {
    const parsed = parseQuizJSON(raw);
    const candidate = parsed?.quiz ?? parsed; // model might omit root key
    // candidate likely missing id/createdAt; we'll inject then validate
    const base = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        topic: candidate?.topic ?? "unknown",
        level: candidate?.level === "intermediate" ? "intermediate" : "beginner",
        locale: candidate?.locale === "hi" ? "hi" : candidate?.locale === "gu" ? "gu" : "en",
        questions: Array.isArray(candidate?.questions) ? candidate.questions : [],
    } as any;
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
