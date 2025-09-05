// /modules/chat/components/VoiceButton.tsx
"use client";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRecorder } from "../hooks/useRecorder";

interface VoiceButtonProps { disabled?: boolean; onFinish(blob: Blob): void; transcribing?: boolean; onRecordingChange?(r: boolean): void; }

export function VoiceButton({ disabled, onFinish, transcribing, onRecordingChange }: VoiceButtonProps) {
    const { start, stop, recording, duration, permissionError } = useRecorder({
        onStopBlob: (b) => onFinish(b),
        onStart: () => onRecordingChange?.(true),
        onError: () => onRecordingChange?.(false)
    });
    useEffect(() => { if (!recording) onRecordingChange?.(false); }, [recording, onRecordingChange]);

    const secs = Math.round(duration / 1000);
    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant={recording ? "destructive" : "secondary"}
                disabled={disabled || transcribing}
                aria-pressed={recording}
                aria-label={transcribing ? "Transcribing audio" : recording ? "Stop recording" : "Start voice input"}
                onClick={() => transcribing ? undefined : (recording ? stop() : start())}
                className={recording ? "relative ring-2 ring-red-500/60 animate-pulse" : ""}
            >
                {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            {recording && <span className="text-xs tabular-nums" aria-live="polite">{secs}s</span>}
            {transcribing && !recording && <span className="text-xs text-muted-foreground" aria-live="polite">Transcribing…</span>}
            {permissionError && <span className="text-xs text-red-500">{permissionError}</span>}
        </div>
    );
}
