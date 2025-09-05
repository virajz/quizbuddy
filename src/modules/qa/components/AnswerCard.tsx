// /modules/qa/components/AnswerCard.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AskQuestionResponse } from "../types/qa.types";
import { ExternalLink } from "lucide-react";
import * as React from "react";

export function AnswerCard({ answer }: { answer: AskQuestionResponse["answer"] }) {
    if (!answer?.text) return null;
    return (
        <Card>
            <CardHeader><CardTitle>Explanation</CardTitle></CardHeader>
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
                    <div className="text-sm opacity-80"><strong>Example:</strong> {answer.examples[0]}</div>
                ) : null}
                {answer.resources?.length ? (
                    <div className="pt-2 border-t mt-4">
                        <h4 className="mb-2 text-sm font-medium tracking-tight">Study material</h4>
                        <ul className="space-y-2">
                            {answer.resources.map((r) => {
                                let domain: string | undefined;
                                try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
                                return (
                                    <li key={r.url} className="group flex items-start gap-2">
                                        <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition" aria-hidden="true" />
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                                title={r.title}
                                            >{r.title}</a>
                                            {domain ? <div className="text-xs text-muted-foreground truncate">{domain}</div> : null}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
