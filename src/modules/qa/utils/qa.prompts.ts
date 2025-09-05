// /modules/qa/utils/qa.prompts.ts
export function buildQAPrompt(input: { question: string; level: string; locale?: string }) {
    return [
        `Question: ${input.question}`,
        `Audience: ${input.level} learner`,
        `Locale: ${input.locale ?? "en"}`,
        "Constraints: One concise explanation, bold one key term once, short example, avoid slang.",
        "Return JSON only as specified.",
    ].join("\n");
}
