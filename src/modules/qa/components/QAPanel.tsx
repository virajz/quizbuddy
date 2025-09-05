// /modules/qa/components/QAPanel.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "./AnswerCard";
import { useAskQuestion } from "../hooks/useAskQuestion";

export function QAPanel() {
    const [q, setQ] = useState("");
    const { loading, data, error, ask } = useAskQuestion();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!q.trim()) return;
        await ask({ question: q.trim(), level: "beginner", locale: "en-IN" });
    }

    return (
        <div className="space-y-4">
            <form onSubmit={onSubmit} className="flex gap-2">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ask about photosynthesis or Pythagoras…"
                    aria-label="Your question"
                />
                <Button type="submit" disabled={loading || !q.trim()}>
                    {loading ? "Thinking…" : "Ask"}
                </Button>
            </form>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {data ? <AnswerCard answer={data.answer} /> : null}
        </div>
    );
}
