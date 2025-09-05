"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQA } from "../state/QAContext";

function formatWhen(ts: number) {
    try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

export function HistoryPanel() {
    const { history, setData, setPrefillQuestion } = useQA();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Click on an item to load it into the editor.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[520px]">
                    <ul className="divide-y">
                        {history.length === 0 ? (
                            <li className="p-4 text-sm opacity-70">No history yet. Ask something to get started.</li>
                        ) : (
                            history.map((h) => (
                                <li
                                    key={h.id}
                                    role="button"
                                    className="cursor-pointer p-4 hover:bg-muted/50"
                                    onClick={() => {
                                        if (h.response) setData(h.response);
                                        setPrefillQuestion(h.request.question);
                                    }}
                                    title="Click to load this item"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="line-clamp-1 text-sm font-medium">{h.request.question}</div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{h.request.level}</Badge>
                                            <Badge variant="secondary">
                                                {h.request.locale === "en" ? "EN" : h.request.locale === "hi" ? "HI" : "GU"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-xs opacity-70">{formatWhen(h.timestamp)}</div>
                                    {!h.response ? (
                                        <div className="mt-1 text-xs text-red-600">Failed to fetch</div>
                                    ) : null}
                                </li>
                            ))
                        )}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
