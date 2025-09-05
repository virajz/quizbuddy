// /modules/qa/utils/qa.prompts.ts
export function buildQAPrompt(input: { question: string; level: string; locale: "en" | "hi" | "gu" }) {
    const langName = input.locale === "hi" ? "Hindi" : input.locale === "gu" ? "Gujarati" : "English";
    const style = [
        "You are a friendly, patient tutor.",
        "Explain simply, avoid jargon, define new terms, include one concrete example.",
        "Keep to 120–150 words.",
        "Output ONLY JSON with keys: answer.text, answer.keyTerms[], answer.examples[], answer.readingLevel, answer.resources[].",
        "answer.resources is optional and if present is an array of up to 3 study material objects: { title, url, source }.",
        "Rules for resources: only high-quality educational reputable sources, prefer locale language if available else English, HTTPS absolute URLs, no shortened links, no tracking or affiliate params, no login walls, no generic homepages—use specific canonical page.",
        "Prefer domains such as: khanacademy.org, britannica.com, wikipedia.org, ck12.org, bbc.co.uk/bitesize, mathsisfun.com, nasa.gov, noaa.gov, mit.edu, harvard.edu.",
        "Do not invent more than 3 resources. If unsure, return fewer.",
        "Ensure JSON is valid and nothing else is output."
    ].join(" ");
    return [
        `Language: ${langName} (respond entirely in ${langName})`,
        `Learner level: ${input.level}`,
        `Question: ${input.question}`,
        style,
        "Return only JSON as specified.",
    ].join("\n");
}
