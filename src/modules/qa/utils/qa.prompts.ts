// /modules/qa/utils/qa.prompts.ts
export function buildQAPrompt(input: { question: string; level: string; locale: "en" | "hi" | "gu" }) {
    const langName = input.locale === "hi" ? "Hindi" : input.locale === "gu" ? "Gujarati" : "English";
    const style =
        "You are a friendly, patient tutor. Explain simply, avoid jargon, define new terms, include one concrete example. Keep to 120–150 words. Output JSON with keys: answer.text, answer.keyTerms[], answer.examples[], answer.readingLevel.";
    return [
        `Language: ${langName} (respond entirely in ${langName})`,
        `Learner level: ${input.level}`,
        `Question: ${input.question}`,
        style,
        "Return only JSON as specified.",
    ].join("\n");
}
