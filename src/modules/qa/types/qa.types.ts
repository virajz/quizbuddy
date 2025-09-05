// /modules/qa/types/qa.types.ts
export type Answer = {
    text: string;
    keyTerms: string[];
    examples?: string[];
    readingLevel: "grade6-8" | "grade9-10";
};

export type AskQuestionRequest = {
    question: string;
    level: "beginner" | "intermediate";
    locale: "en" | "hi" | "gu"; // en: English, hi: Hindi, gu: Gujarati
};

export type AskQuestionResponse = {
    answer: Answer;
    metadata: {
        tokens?: number;
        model?: string;
        latencyMs?: number;
    };
};

export type HistoryEntry = {
    id: string;
    timestamp: number;
    request: AskQuestionRequest;
    response: AskQuestionResponse | null; // null if failed
};
