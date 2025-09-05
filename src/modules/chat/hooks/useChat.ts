// /modules/chat/hooks/useChat.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatRequest, ChatStreamChunk } from "../types/chat.types";
import { archiveSession, loadChatHistory } from "../utils/chat.history.store";
import { logChatEvent } from "@/lib/firebase.server";

function newId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcribing, setTranscribing] = useState(false);
    const [sessionId, setSessionId] = useState(() => newId());
    const [focusCounter, setFocusCounter] = useState(0); // to trigger textarea focus after transcript
    const [history, setHistory] = useState(() => loadChatHistory());
    const abortRef = useRef<AbortController | null>(null);
    const pendingAssistantRef = useRef<string>("");
    const lastTranscriptLangRef = useRef<string | undefined>(undefined);

    const append = useCallback((role: ChatMessage["role"], content: string) => {
        setMessages(prev => [...prev, { id: newId(), role, content, createdAt: Date.now() }]);
    }, []);

    const send = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setError(null);
        append("user", text.trim());
        setInput("");
        setLoading(true); setStreaming(true);
        const controller = new AbortController();
        abortRef.current = controller;
        const userAssistantMessages = messages.concat({ id: newId(), role: "user", content: text.trim(), createdAt: Date.now() }).filter(m => m.role !== "system");
        // Optional: if last transcript language not English, nudge model
        let langNote: ChatMessage[] = [];
        if (lastTranscriptLangRef.current && lastTranscriptLangRef.current !== "en") {
            langNote = [{ id: newId(), role: "system", content: `Respond in ${lastTranscriptLangRef.current}.`, createdAt: Date.now() }];
        }
        const request: ChatRequest = { messages: [...userAssistantMessages.slice(-32), ...langNote], sessionId };
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal: controller.signal });
        if (!res.ok) {
            setError(await res.text()); setLoading(false); setStreaming(false); return;
        }
        // create placeholder assistant message
        const assistantId = newId();
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }]);
        const reader = res.body?.getReader();
        if (!reader) { setError("No stream"); setLoading(false); setStreaming(false); return; }
        pendingAssistantRef.current = assistantId;
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunkText = decoder.decode(value, { stream: true });
                // Expect newline-delimited JSON ChatStreamChunk
                for (const line of chunkText.split(/\n+/).filter(Boolean)) {
                    try {
                        const data: ChatStreamChunk = JSON.parse(line);
                        if (data.content) {
                            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.content } : m));
                        }
                        if (data.done) {
                            setLoading(false); setStreaming(false); abortRef.current = null; return;
                        }
                        if (data.error) { setError(data.error); }
                    } catch { /* ignore malformed segment */ }
                }
            }
        } catch (e: any) {
            if (e.name !== "AbortError") setError(e?.message || "Stream error");
        } finally { setLoading(false); setStreaming(false); abortRef.current = null; }
    }, [append, messages, sessionId]);

    const stop = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const regenerate = useCallback(() => {
        const lastUser = [...messages].reverse().find(m => m.role === "user");
        if (lastUser) send(lastUser.content);
    }, [messages, send]);

    const clear = useCallback(() => {
        if (messages.length) {
            archiveSession(sessionId, messages.filter(m => m.role !== "system"));
            setHistory(loadChatHistory());
            // fire-and-forget logging
            logChatEvent({ type: "clear", sessionId }).catch(() => { });
        }
        setMessages([]); setSessionId(newId()); setError(null); setInput("");
    }, [messages, sessionId]);

    const transcribeAndSend = useCallback(async (blob: Blob) => {
        if (!blob) return;
        try {
            setTranscribing(true);
            const base64 = await blobToBase64(blob);
            // Normalize MIME (strip codecs) for server whitelist match
            const audioMime = (blob.type || "audio/webm").split(";")[0];
            const res = await fetch("/api/chat/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioMime, base64 }) });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json() as { text: string; language?: string };
            if (json.language) lastTranscriptLangRef.current = json.language.toLowerCase();
            if (json.text.trim()) {
                // Put transcript in input for user to review/edit instead of auto-sending
                setInput(json.text.trim());
                setFocusCounter(c => c + 1);
            } else {
                setError("Empty transcript");
            }
        } catch (e: any) { setError(e?.message || "Transcription failed"); }
        finally { setTranscribing(false); }
    }, [send]);

    useEffect(() => {
        // auto-scroll handled in MessageList; just dependency placeholder
    }, [messages]);

    return { messages, input, setInput, loading, streaming, error, sessionId, send, stop, regenerate, clear, transcribeAndSend, history, transcribing, focusCounter };
}

async function blobToBase64(blob: Blob) {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = ""; for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
