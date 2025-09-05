// /lib/validators.ts
import { z } from "zod";

export const askQuestionSchema = z.object({
    question: z.string().min(4).max(500),
    level: z.enum(["beginner", "intermediate"]),
    locale: z.enum(["en", "hi", "gu"]),
});

// Optional: server response validation (not enforced in route yet)
export const answerResourceSchema = z.object({
    title: z.string().min(3).max(150), // we truncate to 120 but accept up to 150 raw
    url: z.string().url().regex(/^https:\/\//, "Must be https"),
    source: z.string().optional(),
});

export const answerSchema = z.object({
    text: z.string(),
    keyTerms: z.array(z.string()),
    examples: z.array(z.string()).optional(),
    readingLevel: z.enum(["grade6-8", "grade9-10"]),
    resources: z.array(answerResourceSchema).max(3).optional(),
});
