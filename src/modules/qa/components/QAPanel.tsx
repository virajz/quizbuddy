// /modules/qa/components/QAPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AnswerCard } from "./AnswerCard";
import { useQA } from "../state/QAContext";
import type { AskQuestionRequest } from "../types/qa.types";
import { Send } from "lucide-react";

export function QAPanel() {
    const [q, setQ] = useState("");
    const [level, setLevel] = useState<"beginner" | "intermediate">("beginner");
    const [locale, setLocale] = useState<"en" | "hi" | "gu">("en");
    const { loading, data, error, ask, prefillQuestion, setPrefillQuestion } = useQA();

    useEffect(() => {
        if (prefillQuestion) {
            setQ(prefillQuestion);
            setPrefillQuestion("");
        }
    }, [prefillQuestion, setPrefillQuestion]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const question = q.trim();
        if (!question) return;
        const input: AskQuestionRequest = { question, level, locale };
        await ask(input);
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Row 1 — full-width selects side by side */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Level</Label>
                                <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Language</Label>
                                <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="gu">Gujarati</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 2 — input with embedded icon button */}
                        <div className="grid gap-2">
                            <Label htmlFor="question">Your question</Label>
                            <div className="relative">
                                {/* reserve space for the icon button to avoid overlap */}
                                <Input
                                    id="question"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="What is PRD?"
                                    aria-label="Your question"
                                    className="h-11 pr-14"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !q.trim()}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-md"
                                    variant="default"
                                    aria-label="Ask"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </form>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <Separator />
                    {data ? (
                        <AnswerCard answer={data.answer} />
                    ) : (
                        <p className="text-sm opacity-70">Your answer will appear here.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
