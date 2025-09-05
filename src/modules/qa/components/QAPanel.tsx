// /modules/qa/components/QAPanel.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AnswerCard } from "./AnswerCard";
import { useAskQuestion } from "../hooks/useAskQuestion";
import { HistoryPanel } from "./HistoryPanel";
import type { AskQuestionRequest } from "../types/qa.types";

export function QAPageShell() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
            <QAPanel />
            <HistoryPanel />
        </div>
    );
}

export function QAPanel() {
    const [q, setQ] = useState("");
    const [level, setLevel] = useState<"beginner" | "intermediate">("beginner");
    const [locale, setLocale] = useState<"en" | "hi" | "gu">("en");
    const { loading, data, error, ask } = useAskQuestion();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const input: AskQuestionRequest = { question: q.trim(), level, locale };
        if (!input.question) return;
        await ask(input);
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <form onSubmit={onSubmit} className="space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="flex-1">
                                <Label htmlFor="question">Your question</Label>
                                <Input
                                    id="question"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Ask about photosynthesis or Pythagoras…"
                                    aria-label="Your question"
                                />
                            </div>
                            <div className="grid w-full gap-2 md:w-[160px]">
                                <Label>Level</Label>
                                <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid w-full gap-2 md:w-[160px]">
                                <Label>Language</Label>
                                <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="gu">Gujarati</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={loading || !q.trim()}>
                                    {loading ? "Thinking…" : "Ask"}
                                </Button>
                            </div>
                        </div>
                    </form>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <Separator />
                    {data ? <AnswerCard answer={data.answer} /> : <p className="text-sm opacity-70">Your answer will appear here.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
