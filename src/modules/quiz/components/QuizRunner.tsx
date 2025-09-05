// /modules/quiz/components/QuizRunner.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuizContext } from "../state/QuizContext";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultsSummary";

export function QuizRunner() {
    const { quiz, currentIndex, next, prev, selectOption, checkCurrent, answers, checked, finished, loading } = useQuizContext() as any;
    const current = quiz?.questions[currentIndex];

    if (!quiz) return null;

    if (finished) {
        return <ResultsSummary />;
    }

    const total = quiz.questions.length;
    const progress = ((currentIndex) / (total - 1)) * 100;
    const isChecked = current ? checked.has(current.id) : false;
    const isCorrect = current && answers.get(current.id) === current.correctOptionId;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-3">
                    <span>{quiz.topic}</span>
                    <Badge variant="outline">{quiz.level}</Badge>
                    <Badge variant="secondary">{quiz.locale.toUpperCase()}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Progress value={progress} className="flex-1" />
                    <div className="text-sm tabular-nums">{currentIndex + 1}/{total}</div>
                </div>
                {loading && !finished ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-4"><Loader2 className="h-4 w-4 animate-spin" /> Generating quiz...</div>
                ) : current ? (
                    <QuestionCard
                        question={current}
                        selected={answers.get(current.id)}
                        onSelect={(id) => selectOption(current.id, id)}
                        onCheck={() => checkCurrent()}
                        checked={isChecked}
                        correct={isCorrect}
                    />
                ) : null}
                <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={prev} disabled={currentIndex === 0}> <ChevronLeft className="h-4 w-4" /> Prev</Button>
                    {currentIndex < total - 1 ? (
                        <Button variant="outline" size="sm" onClick={next} disabled={!isChecked}>Next <ChevronRight className="h-4 w-4" /></Button>
                    ) : (
                        <Button size="sm" onClick={next} disabled={!isChecked}>See Results</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
