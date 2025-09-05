// REMOVE: "use server";
import "server-only";                // ✅ ensures this file can’t be imported by client
import Groq from "groq-sdk";         // or: import { Groq } from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.local");
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const MODEL_DEFAULT = process.env.GROQ_MODEL_DEFAULT ?? "llama-3.3-70b-versatile";

export async function getTutorAnswer(prompt: string) {
    const started = Date.now();
    const chat = await groq.chat.completions.create({
        model: MODEL_DEFAULT,
        temperature: 0.2,
        max_tokens: 400,
        messages: [
            { role: "system", content: SYSTEM_TUTOR_STYLE },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });
    const latencyMs = Date.now() - started;
    const content = chat.choices?.[0]?.message?.content ?? "{}";
    return { content, latencyMs, model: MODEL_DEFAULT };
}

const SYSTEM_TUTOR_STYLE =
    "You are a friendly, patient tutor. Explain concepts simply, avoid jargon, define new terms, include one concrete example. Keep to 120–150 words. Output JSON with keys: answer.text, answer.keyTerms[], answer.examples[], answer.readingLevel, answer.cached=false.";
