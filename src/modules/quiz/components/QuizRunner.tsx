// /modules/quiz/components/QuizRunner.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2, Timer as TimerIcon } from "lucide-react";
import { useQuizContext } from "../state/QuizContext";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultsSummary";

export function QuizRunner() {
    const { quiz, currentIndex, next, prev, selectOption, checkCurrent, answers, checked, finished, loading, timeLeft, results } = useQuizContext() as any;
    const current = quiz?.questions[currentIndex];

    if (!quiz) return null;

    if (finished) {
        return <ResultsSummary />;
    }

    const total = quiz.questions.length;
    const progress = ((currentIndex) / (total - 1)) * 100;
    const isChecked = current ? checked.has(current.id) : false;
    const isCorrect = current && answers.get(current.id) === current.correctOptionId;
    const timedOut = !!(current && results.find((r: any) => r.questionId === current.id && r.timedOut));

    const mm = String(Math.floor((timeLeft ?? 0) / 60)).padStart(2, "0");
    const ss = String((timeLeft ?? 0) % 60).padStart(2, "0");
    const timeFormatted = `${mm}:${ss}`;

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
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <TimerIcon className={`h-4 w-4 ${isChecked ? "text-muted-foreground" : "text-primary"}`} />
                        <span className="tabular-nums w-[48px] text-right">{timeFormatted}</span>
                    </div>
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
                        timedOut={timedOut}
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
