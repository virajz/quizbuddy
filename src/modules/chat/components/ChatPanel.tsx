// /modules/chat/components/ChatPanel.tsx
"use client";
import { useChat } from "../hooks/useChat";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { Loader2, Mic } from "lucide-react";

export function ChatPanel() {
    const { messages, input, setInput, send, streaming, loading, error, clear, stop, regenerate, transcribeAndSend, history, transcribing, focusCounter } = useChat();
    const [recording, setRecording] = useState(false);

    const handleVoice = useCallback((blob: Blob) => { transcribeAndSend(blob); }, [transcribeAndSend]);
    return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto border rounded-lg overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
                <h2 className="font-semibold">Brainstorm Chat</h2>
                <div className="flex gap-2 items-center">
                    <Button variant="secondary" type="button" onClick={clear}>New Chat</Button>
                </div>
            </header>
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
                <Composer value={input} onChange={setInput} onSend={send} disabled={loading} streaming={streaming} transcribing={transcribing} focusCounter={focusCounter} onStop={stop} onRegenerate={regenerate} canRegenerate={messages.filter(m => m.role === "user").length > 0} onVoice={(b) => { setRecording(false); handleVoice(b); }} />
            </div>
        </div>
    );
}
