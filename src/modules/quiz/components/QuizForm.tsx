// /modules/quiz/components/QuizForm.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2 } from "lucide-react";
import type { QuizGenerateRequest } from "../types/quiz.types";
import { useQuizContext } from "../state/QuizContext";

export function QuizForm() {
    const { generate, loading, error } = useQuizContext();
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState<"beginner" | "intermediate">("beginner");
    const [locale, setLocale] = useState<"en" | "hi" | "gu">("en");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const clean = topic.trim();
        if (!clean) return;
        const req: QuizGenerateRequest = { topic: clean, level, locale };
        await generate(req);
    }

    return (
        <Card>
            <CardHeader><CardTitle>Generate Quiz</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Level</Label>
                            <Select value={level} onValueChange={(v: "beginner" | "intermediate") => setLevel(v)}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Level" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Language</Label>
                            <Select value={locale} onValueChange={(v: "en" | "hi" | "gu") => setLocale(v)}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Language" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="gu">Gujarati</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="topic">Topic</Label>
                        <div className="relative">
                            <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. algebra basics" className="h-11 pr-12" />
                            <Button type="submit" disabled={loading || !topic.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0" aria-label="Generate quiz">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </form>
            </CardContent>
        </Card>
    );
}
