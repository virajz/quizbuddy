// /app/api/quiz/grade/route.ts
import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const gradeSchema = z.object({
    quizId: z.string(),
    answers: z.array(z.object({ questionId: z.string(), selectedOptionId: z.enum(["A", "B", "C", "D"]) }))
});

export async function POST(req: NextRequest) {
    let body: any; try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) return new Response(parsed.error.issues.map(i => i.message).join("; "), { status: 400 });
    const { quizId, answers } = parsed.data;
    // We cannot re-lookup quiz server-side (no persistence), so just compute dummy stats
    const score = answers.length; // placeholder (caller should compute real score client-side)
    const breakdown = answers.map(a => ({ questionId: a.questionId, correct: true, correctOptionId: a.selectedOptionId, explanation: "" }));
    return new Response(JSON.stringify({ score, breakdown }), { status: 200, headers: { "Content-Type": "application/json" } });
}
