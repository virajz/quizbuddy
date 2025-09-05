// /modules/chat/components/Composer.tsx
"use client";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextareaHTMLAttributes } from "react";
import { Send } from "lucide-react";
import { VoiceButton } from "./VoiceButton";

interface ComposerProps {
    value: string;
    onChange(v: string): void;
    onSend(v: string): void;
    disabled?: boolean;
    onVoice(blob: Blob): void;
    streaming: boolean;
    transcribing: boolean;
    focusCounter: number; // triggers focus when increments
    onStop(): void;
    onRegenerate(): void;
    canRegenerate: boolean;
}

export function Composer({ value, onChange, onSend, disabled, onVoice, streaming, transcribing, onStop, onRegenerate, canRegenerate, focusCounter }: ComposerProps) {
    const ref = useRef<HTMLTextAreaElement | null>(null);
    // focus when transcript placed
    useEffect(() => {
        if (focusCounter > 0) {
            ref.current?.focus();
            // move caret to end
            const len = ref.current?.value.length ?? 0;
            ref.current?.setSelectionRange(len, len);
        }
    }, [focusCounter]);

    const handleKey: TextareaHTMLAttributes<HTMLTextAreaElement>["onKeyDown"] = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (streaming) { onStop(); return; }
            if (value.trim()) onSend(value);
        }
    };
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
                <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey} placeholder={transcribing ? "Transcribing audio…" : "Type your idea or question..."} className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary/40 min-h-[70px] disabled:opacity-60" aria-label="Chat input" disabled={(disabled && !streaming) || transcribing && !value} />
                <div className="flex flex-col gap-2 items-stretch">
                    <Button type="button" onClick={() => streaming ? onStop() : (value.trim() && onSend(value))} disabled={!streaming && (!value.trim() || disabled || transcribing)} aria-label={streaming ? "Stop response" : "Send message"}>
                        {streaming ? "Stop" : <Send className="w-4 h-4" />}
                    </Button>
                    <VoiceButton disabled={streaming} onFinish={onVoice} transcribing={transcribing} onRecordingChange={() => { /* ChatPanel handles indicator */ }} />
                </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Enter to {streaming ? "stop" : "send"} • Shift+Enter = newline</span>
                {canRegenerate && !streaming && <button type="button" onClick={onRegenerate} className="underline focus:outline-none focus:ring" aria-label="Regenerate last response">Regenerate</button>}
            </div>
        </div>
    );
}
