// /lib/validators.ts
import { z } from "zod";

export const askQuestionSchema = z.object({
    question: z.string().min(4).max(500),
    level: z.enum(["beginner", "intermediate"]),
    locale: z.enum(["en", "hi", "gu"]),
});
