// /modules/qa/types/qa.types.ts
export type Answer = {
    text: string;                 // concise explanation (120–150 words target)
    keyTerms: string[];           // e.g., ["photosynthesis", "chlorophyll"]
    examples?: string[];          // one concrete example encouraged
    readingLevel: "grade6-8" | "grade9-10";
    cached: boolean;              // semantic cache hit (if implemented later)
};

export type AskQuestionRequest = {
    question: string;
    level?: "beginner" | "intermediate";
    locale?: string;              // e.g., "en-IN"
};

export type AskQuestionResponse = {
    answer: Answer;
    metadata: {
        tokens?: number;
        model?: string;
        latencyMs?: number;
    };
};
