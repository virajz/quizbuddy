// /modules/chat/hooks/useRecorder.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseRecorderOptions {
    mimeType?: string;
    onError?(err: Error): void;
    maxMs?: number;
    onStopBlob?(blob: Blob): void; // callback with final blob
    onStart?(): void;
}

export function useRecorder(opts: UseRecorderOptions = {}) {
    const [recording, setRecording] = useState(false);
    const [duration, setDuration] = useState(0); // ms
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const mediaRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!recording) return;
        const started = performance.now();
        const maxMs = opts.maxMs ?? 30_000; // 30s default cap
        timerRef.current = window.setInterval(() => {
            const elapsed = performance.now() - started;
            setDuration(elapsed);
            if (elapsed >= maxMs) {
                // auto-stop at cap
                try { mediaRef.current?.stop(); } catch { }
            }
        }, 200);
        return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    }, [recording, opts.maxMs]);

    const start = useCallback(async () => {
        if (recording) return;
        setPermissionError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 44100 } });
            const mimeType = opts.mimeType || (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg");
            const rec = new MediaRecorder(stream, { mimeType });
            mediaRef.current = rec;
            chunksRef.current = [];
            rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            rec.onstart = () => { opts.onStart?.(); };
            rec.onstop = () => {
                try {
                    stream.getTracks().forEach(t => t.stop());
                } catch { }
                const type = rec.mimeType || opts.mimeType || "audio/webm";
                const finalBlob = new Blob(chunksRef.current, { type });
                if (finalBlob.size > 0) opts.onStopBlob?.(finalBlob);
            };
            rec.start();
            setDuration(0); setRecording(true);
        } catch (e: any) {
            setPermissionError(e?.message || "Microphone permission denied");
            opts.onError?.(e);
        }
    }, [opts.mimeType, opts]);

    const stop = useCallback(() => {
        if (!recording) return;
        mediaRef.current?.stop();
        setRecording(false);
    }, [recording]);

    const getBlob = useCallback(() => {
        if (chunksRef.current.length === 0) return null;
        const type = mediaRef.current?.mimeType || "audio/webm";
        return new Blob(chunksRef.current, { type });
    }, []);

    return { start, stop, getBlob, recording, duration, permissionError };
}
