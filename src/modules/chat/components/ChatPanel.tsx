// /modules/chat/components/ChatPanel.tsx
"use client";
import { useChat } from "../hooks/useChat";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { Loader2, History } from "lucide-react";

export function ChatPanel() {
    const { messages, input, setInput, send, streaming, loading, error, clear, stop, regenerate, transcribeAndSend, history, transcribing, focusCounter, loadSession, sessionId } = useChat();
    const [recording, setRecording] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const userMsgCount = messages.filter(m => m.role === "user").length;
    const canRegenerate = userMsgCount > 0;
    const relative = useCallback((ts: number) => {
        const diff = Date.now() - ts;
        const sec = Math.floor(diff / 1000);
        if (sec < 60) return sec + "s ago";
        const min = Math.floor(sec / 60); if (min < 60) return min + "m ago";
        const hr = Math.floor(min / 60); if (hr < 24) return hr + "h ago";
        const d = Math.floor(hr / 24); return d + "d ago";
    }, []);

    const handleVoice = useCallback((blob: Blob) => { transcribeAndSend(blob); }, [transcribeAndSend]);
    return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto border rounded-lg overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm gap-2">
                <h2 className="font-semibold flex items-center gap-2">Brainstorm Chat</h2>
                <div className="flex gap-2 items-center">
                    <Button type="button" variant={showHistory ? "default" : "secondary"} onClick={() => setShowHistory(h => !h)} aria-pressed={showHistory} aria-label="Toggle history" className="flex items-center gap-1">
                        <History className="w-4 h-4" /> History
                    </Button>
                    <Button variant="secondary" type="button" onClick={clear}>New Chat</Button>
                </div>
            </header>
            {showHistory && (
                <aside className="border-b bg-muted/30 max-h-52 overflow-y-auto text-sm">
                    {history.length === 0 && <div className="px-4 py-3 text-muted-foreground">No history yet.</div>}
                    <ul className="divide-y">
                        {history.map(h => {
                            const active = h.id === sessionId;
                            return (
                                <li key={h.id}>
                                    <button
                                        type="button"
                                        onClick={() => loadSession(h.id)}
                                        className={`w-full text-left px-4 py-2 hover:bg-muted/60 focus:outline-none focus:ring flex flex-col gap-0.5 ${active ? "bg-primary/10" : ""}`}
                                        aria-current={active}
                                    >
                                        <span className="font-medium truncate">{h.title || "Session"}</span>
                                        <span className="text-[11px] text-muted-foreground flex justify-between">
                                            <span>{relative(h.updatedAt || h.createdAt)}</span>
                                            <span>{h.messages.length} msgs</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            )}
            <div className="flex-1 min-h-0 overflow-y-scroll">
                <MessageList messages={messages} streaming={streaming} />
            </div>
            {(recording || transcribing) && (
                <div className="px-4 py-1 text-xs flex items-center gap-2 border-t bg-muted/40" aria-live="polite">
                    {recording ? <>
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Recording… speak now</span>
                    </> : <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Transcribing audio…</span>
                    </>}
                </div>
            )}
            {error && <div className="px-4 py-2 text-sm text-red-600 border-t bg-red-50">{error}</div>}
            <div className="p-3 border-t bg-background">
                <Composer value={input} onChange={setInput} onSend={send} disabled={loading} streaming={streaming} transcribing={transcribing} focusCounter={focusCounter} onStop={stop} onRegenerate={regenerate} canRegenerate={canRegenerate} onVoice={(b) => { setRecording(false); handleVoice(b); }} />
            </div>
        </div>
    );
}
