// /modules/qa/hooks/useAskQuestion.ts
import { useState } from "react";
import type { AskQuestionRequest, AskQuestionResponse } from "../types/qa.types";

export function useAskQuestion() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AskQuestionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function ask(input: AskQuestionRequest) {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/qa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            if (!res.ok) throw new Error(await res.text());
            const json = (await res.json()) as AskQuestionResponse;
            setData(json);
            return json;
        } catch (e: any) {
            setError(e?.message ?? "Request failed");
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { loading, data, error, ask };
}
