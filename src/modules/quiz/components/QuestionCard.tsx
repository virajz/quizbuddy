// /modules/quiz/components/QuestionCard.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, CircleDot } from "lucide-react";
import type { QuizQuestion, QuizOptionId } from "../types/quiz.types";
import { useCallback } from "react";

export function QuestionCard({ question, selected, onSelect, onCheck, checked, correct, timedOut }: {
    question: QuizQuestion;
    selected?: QuizOptionId;
    onSelect: (id: QuizOptionId) => void;
    onCheck: () => void;
    checked: boolean;
    correct?: boolean;
    timedOut?: boolean;
}) {
    const disabled = checked;
    const handleKey = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;
        const key = e.key.toUpperCase();
        if (["A", "B", "C", "D"].includes(key)) {
            onSelect(key as QuizOptionId);
        }
        if (e.key === "Enter" && selected) onCheck();
    }, [disabled, onSelect, selected, onCheck]);

    const renderIcon = (optId: QuizOptionId) => {
        if (!checked) {
            if (selected === optId) return <CircleDot className="h-4 w-4 text-primary" />;
            return null;
        }
        // after check / timeout
        const isCorrectOption = question.correctOptionId === optId;
        if (isCorrectOption) return <CheckCircle className="h-4 w-4 text-green-600" />;
        if (selected === optId) return <XCircle className="h-4 w-4 text-red-600" />;
        return null;
    };

    return (
        <Card onKeyDown={handleKey} tabIndex={0} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <CardContent className="space-y-4 p-4">
                <div className="text-lg font-medium leading-relaxed" aria-live="polite">{question.stem}</div>
                <div role="radiogroup" aria-label="Answer choices" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map(opt => {
                        const isSelected = selected === opt.id;
                        const isCorrectOption = question.correctOptionId === opt.id;
                        const base = "flex flex-col items-start justify-start gap-2 rounded-md border p-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";
                        const idleStyles = !checked && isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50";
                        let postStyles = "";
                        if (checked) {
                            if (isCorrectOption) postStyles = "border-green-600 bg-green-50 dark:bg-green-900/20";
                            else if (isSelected) postStyles = "border-red-600 bg-red-50 dark:bg-red-900/20";
                            else postStyles = "opacity-80";
                        }
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                disabled={disabled}
                                onClick={() => !disabled && onSelect(opt.id)}
                                className={`${base} ${idleStyles} ${postStyles}`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="font-semibold flex items-center gap-1">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold">{opt.id}</span>
                                        {renderIcon(opt.id)}
                                    </span>
                                </div>
                                <div className="text-sm leading-snug text-left w-full">{opt.text}</div>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3">
                    <Button size="sm" onClick={onCheck} disabled={disabled || !selected}>Check answer</Button>
                    {checked && !timedOut && (
                        <div className={`flex items-center gap-1 text-sm ${correct ? "text-green-600" : "text-red-600"}`}>
                            {correct ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>{correct ? "Correct" : "Incorrect"}</span>
                        </div>
                    )}
                    {timedOut && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                            <XCircle className="h-4 w-4" /> <span>Time&apos;s up</span>
                        </div>
                    )}
                </div>
                {checked && !correct && !timedOut && (
                    <div className="rounded-md bg-muted/60 p-3 text-sm" aria-live="polite">{question.explanation}</div>
                )}
                {checked && correct && !timedOut && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm" aria-live="polite">{question.explanation}</div>
                )}
            </CardContent>
        </Card>
    );
}
