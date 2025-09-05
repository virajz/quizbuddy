// /modules/quiz/components/ResultsSummary.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, ChevronLeft, Loader2 } from "lucide-react";
import { useQuizContext } from "../state/QuizContext";
import type { QuizQuestion } from "../types/quiz.types";

export function ResultsSummary() {
    const { quiz, answers, reset, generate, loading } = useQuizContext();
    if (!quiz) return null;
    const score = quiz.questions.reduce((acc: number, q: QuizQuestion) => acc + (answers.get(q.id) === q.correctOptionId ? 1 : 0), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">Results <Badge variant="secondary">{score}/5</Badge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {quiz.questions.map((q) => {
                        const chosen = answers.get(q.id);
                        const correct = chosen === q.correctOptionId;
                        return (
                            <div key={q.id} className="rounded-md border p-3 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="font-medium leading-relaxed">{q.stem}</div>
                                    <Badge variant={correct ? "secondary" : "outline"}>{correct ? "Correct" : "Incorrect"}</Badge>
                                </div>
                                <div className="text-sm">
                                    <strong>Answer:</strong> {q.correctOptionId}. {q.options.find(o => o.id === q.correctOptionId)?.text}
                                </div>
                                <div className="text-sm opacity-90">{q.explanation}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3">
                    <Button size="sm" disabled={loading} onClick={() => generate({ topic: quiz.topic, level: quiz.level, locale: quiz.locale, seed: quiz.id.slice(0, 8) })}>
                        {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-1" />} {loading ? "Generating..." : "Retake similar quiz"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={reset}><ChevronLeft className="h-4 w-4 mr-1" /> Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}
