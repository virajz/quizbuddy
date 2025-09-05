// /modules/quiz/components/QuestionCard.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X } from "lucide-react";
import type { QuizQuestion, QuizOptionId } from "../types/quiz.types";
import { useCallback } from "react";

export function QuestionCard({ question, selected, onSelect, onCheck, checked, correct }: {
    question: QuizQuestion;
    selected?: QuizOptionId;
    onSelect: (id: QuizOptionId) => void;
    onCheck: () => void;
    checked: boolean;
    correct?: boolean;
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

    return (
        <Card onKeyDown={handleKey} tabIndex={0} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <CardContent className="space-y-4 p-4">
                <div className="text-lg font-medium leading-relaxed" aria-live="polite">{question.stem}</div>
                <RadioGroup value={selected} onValueChange={v => !disabled && onSelect(v as QuizOptionId)} className="space-y-2">
                    {question.options.map(opt => (
                        <label key={opt.id} className={`flex items-start gap-3 rounded-md border p-2 cursor-pointer hover:bg-muted/40 ${disabled ? "opacity-80" : ""} ${selected === opt.id ? "border-primary" : ""}`}>
                            <RadioGroupItem value={opt.id} id={`${question.id}_${opt.id}`} disabled={disabled} />
                            <div className="flex-1">
                                <div className="font-semibold">{opt.id}.</div>
                                <div className="text-sm leading-snug">{opt.text}</div>
                            </div>
                        </label>
                    ))}
                </RadioGroup>
                <div className="flex items-center gap-3">
                    <Button size="sm" onClick={onCheck} disabled={disabled || !selected}>Check answer</Button>
                    {checked && (
                        <div className={`flex items-center gap-1 text-sm ${correct ? "text-green-600" : "text-red-600"}`}>
                            {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            <span>{correct ? "Correct" : "Incorrect"}</span>
                        </div>
                    )}
                </div>
                {checked && !correct && (
                    <div className="rounded-md bg-muted/60 p-3 text-sm" aria-live="polite">{question.explanation}</div>
                )}
                {checked && correct && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm" aria-live="polite">{question.explanation}</div>
                )}
            </CardContent>
        </Card>
    );
}
