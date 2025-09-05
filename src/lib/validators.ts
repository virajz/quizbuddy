// /lib/validators.ts
import { z } from "zod";

export const askQuestionSchema = z.object({
    question: z.string().min(4).max(500),
    level: z.enum(["beginner", "intermediate"]).optional().default("beginner"),
    locale: z.string().optional(),
});
