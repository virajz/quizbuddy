// /modules/quiz/state/QuizContext.tsx
"use client";
import { createContext, useContext } from "react";
import { useQuiz } from "../hooks/useQuiz";

const QuizContext = createContext<ReturnType<typeof useQuiz> | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
    const value = useQuiz();
    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizContext() {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error("useQuizContext must be used within QuizProvider");
    return ctx;
}
