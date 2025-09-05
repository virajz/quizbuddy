// /app/api/chat/transcribe/route.ts
import "server-only";
import { NextRequest } from "next/server";
import type { TranscribeRequest, TranscribeResponse } from "@/modules/chat/types/chat.types";
import { groq } from "@/lib/groq";
import { logChatEvent } from "@/lib/firebase.server";

export const runtime = "nodejs";

const ALLOWED = new Set(["audio/webm", "audio/ogg", "audio/wav"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
    let body: TranscribeRequest;
    try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
    if (!body || !ALLOWED.has(body.audioMime)) return new Response("Unsupported media type", { status: 415 });
    let buf: Buffer;
    try { buf = Buffer.from(body.base64, "base64"); } catch { return new Response("Bad base64", { status: 400 }); }
    if (buf.byteLength > MAX_BYTES) return new Response("File too large", { status: 413 });
    // Build a File for SDK (Node 18 provides global File)
    const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    // Cast to any due to TS lib mismatch with Node's polyfilled File / BlobPart types
    // Ensure a plain ArrayBuffer is passed to File for broad lib compatibility
    const copy = new Uint8Array(uint8.byteLength);
    copy.set(uint8);
    const file = new File([copy], `audio.${extFromMime(body.audioMime)}`, { type: body.audioMime });
    let model: string = "distil-whisper-large-v3";
    interface WhisperResult { text?: string; language?: string }
    let result: WhisperResult | null = null;
    try {
        result = await groq.audio.transcriptions.create({ file, model });
    } catch {
        model = "whisper-large-v3";
        try { result = await groq.audio.transcriptions.create({ file, model }); } catch (e2: unknown) {
            const msg = e2 instanceof Error ? e2.message : "Transcription error";
            return new Response(msg, { status: 500 });
        }
    }
    const text: string = result?.text ?? "";
    const language: string | undefined = result?.language;
    const response: TranscribeResponse = { text, language };
    logChatEvent({ type: "stt", model, bytes: buf.byteLength }).catch(() => { });
    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
}

function extFromMime(m: string) { if (m.includes("webm")) return "webm"; if (m.includes("ogg")) return "ogg"; if (m.includes("wav")) return "wav"; return "dat"; }
