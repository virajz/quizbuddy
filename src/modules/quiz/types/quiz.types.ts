// /modules/quiz/types/quiz.types.ts
export type QuizGenerateRequest = {
    topic: string;
    level: "beginner" | "intermediate";
    locale: "en" | "hi" | "gu";
    seed?: string;
};

export type QuizOptionId = "A" | "B" | "C" | "D";

export type QuizQuestion = {
    id: string;
    stem: string;
    options: { id: QuizOptionId; text: string }[];
    correctOptionId: QuizOptionId;
    explanation: string;
    tags?: string[];
};

export type Quiz = {
    id: string;
    topic: string;
    questions: QuizQuestion[];
    level: "beginner" | "intermediate";
    locale: "en" | "hi" | "gu";
    createdAt: number;
};

export type QuizGenerateResponse = { quiz: Quiz; metadata: { model: string; latencyMs: number } };

export type QuizGradeRequest = { quizId: string; answers: { questionId: string; selectedOptionId: QuizOptionId }[] };

export type QuizGradeResponse = {
    score: number; // 0..5
    breakdown: { questionId: string; correct: boolean; correctOptionId: QuizOptionId; explanation: string }[];
};
