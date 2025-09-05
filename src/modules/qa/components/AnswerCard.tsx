// /modules/qa/components/AnswerCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AskQuestionResponse } from "../types/qa.types";

export function AnswerCard({ answer }: { answer: AskQuestionResponse["answer"] }) {
    if (!answer?.text) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Explanation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="leading-7">{answer.text}</p>
                {answer.keyTerms?.length ? (
                    <div className="flex flex-wrap gap-2">
                        {answer.keyTerms.map((k) => (
                            <span key={k} className="rounded-full border px-2 py-1 text-xs">{k}</span>
                        ))}
                    </div>
                ) : null}
                {answer.examples?.length ? (
                    <div className="text-sm opacity-80">
                        <strong>Example:</strong> {answer.examples[0]}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
