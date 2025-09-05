// /modules/quiz/validation.ts
import { z } from "zod";
import type { QuizOptionId } from "./types/quiz.types";

export const quizGenerateRequestSchema = z.object({
    topic: z.string().min(3, "topic too short").max(120, "topic too long"),
    level: z.enum(["beginner", "intermediate"]),
    locale: z.enum(["en", "hi", "gu"]),
    seed: z.string().max(60).optional(),
});

const optionIdEnum = z.enum(["A", "B", "C", "D"]);

const optionSchema = z.object({
    id: optionIdEnum,
    text: z.string().min(1).max(120),
});

const questionSchemaBase = z.object({
    id: z.string().min(1).max(40),
    stem: z.string().min(4).max(180),
    options: z.array(optionSchema).length(4),
    correctOptionId: optionIdEnum,
    explanation: z.string().min(4).max(600), // word limit enforced below
    tags: z.array(z.string().min(1).max(30)).max(5).optional(),
});

export const questionSchema = questionSchemaBase.superRefine((val, ctx) => {
    const ids = new Set(val.options.map(o => o.id));
    if (ids.size !== 4) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "options must have unique ids A-D" });
    const texts = val.options.map(o => o.text.trim());
    const distinctTexts = new Set(texts);
    if (distinctTexts.size !== 4) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "option texts must be distinct" });
    if (!ids.has("A") || !ids.has("B") || !ids.has("C") || !ids.has("D")) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "must include options A,B,C,D" });
    if (!val.options.find(o => o.id === val.correctOptionId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "correctOptionId must match an option" });
    const wordCount = val.explanation.trim().split(/\s+/).length;
    if (wordCount > 60) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "explanation exceeds 60 words" });
});

export const quizSchema = z.object({
    id: z.string().uuid(),
    topic: z.string().min(3).max(120),
    level: z.enum(["beginner", "intermediate"]),
    locale: z.enum(["en", "hi", "gu"]),
    createdAt: z.number().int().positive(),
    questions: z.array(questionSchema).length(5),
});

// Helper to validate stems uniqueness etc.
export function validateQuizBusinessRules(quiz: z.infer<typeof quizSchema>) {
    const stems = new Set<string>();
    for (const q of quiz.questions) {
        if (stems.has(q.stem)) throw new Error("duplicate question stem: " + q.stem.slice(0, 40));
        stems.add(q.stem);
    }
    return quiz;
}

export type QuizSchemaType = z.infer<typeof quizSchema>;
