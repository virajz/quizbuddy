"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useAskQuestion } from "../hooks/useAskQuestion";
// removed unused imports (AskQuestionResponse, HistoryEntry)

type QAContextValue = ReturnType<typeof useAskQuestion> & {
    prefillQuestion: string;
    setPrefillQuestion: (q: string) => void;
    selectedHistoryId: string | null;
    setSelectedHistoryId: (id: string | null) => void;
};

const QAContext = createContext<QAContextValue | null>(null);

export function QAProvider({ children }: { children: React.ReactNode }) {
    const qa = useAskQuestion(); // single source of truth for both panels
    const [prefillQuestion, setPrefillQuestion] = useState("");
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

    const value = useMemo(
        () => ({ ...qa, prefillQuestion, setPrefillQuestion, selectedHistoryId, setSelectedHistoryId }),
        [qa, prefillQuestion, selectedHistoryId]
    );

    return <QAContext.Provider value={value}>{children}</QAContext.Provider>;
}

export function useQA() {
    const ctx = useContext(QAContext);
    if (!ctx) throw new Error("useQA must be used within <QAProvider>");
    return ctx;
}
