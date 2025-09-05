// /modules/qa/hooks/useAskQuestion.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AskQuestionRequest, AskQuestionResponse, HistoryEntry } from "../types/qa.types";
import { loadHistory, saveHistory } from "../utils/history.store";

export function useAskQuestion() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AskQuestionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => { setHistory(loadHistory()); }, []);

    function pushHistory(entry: HistoryEntry) {
        setHistory((prev) => {
            const next = [entry, ...prev];
            saveHistory(next);
            return next;
        });
    }

    async function ask(input: AskQuestionRequest) {
        setLoading(true); setError(null);
        const base: HistoryEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            request: input,
            response: null,
        };
        try {
            const res = await fetch("/api/qa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            if (!res.ok) throw new Error(await res.text());
            const json = (await res.json()) as AskQuestionResponse;
            setData(json);
            pushHistory({ ...base, response: json });
            return json;
        } catch (e: any) {
            setError(e?.message ?? "Request failed");
            pushHistory(base); // store failed attempt (no response)
            return null;
        } finally {
            setLoading(false);
        }
    }

    const sortedHistory = useMemo(
        () => [...history].sort((a, b) => b.timestamp - a.timestamp),
        [history]
    );

    return { loading, data, error, ask, history: sortedHistory, setData };
}
