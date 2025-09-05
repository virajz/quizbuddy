// /modules/qa/utils/qa.mappers.ts
import type { AskQuestionResponse, AnswerResource } from "../types/qa.types";

// allowlist for ranking preference
const ALLOWLIST_DOMAINS = [
    "khanacademy.org",
    "britannica.com",
    "wikipedia.org",
    "ck12.org",
    "bbc.co.uk",
    "bitesize", // treat as part of bbc bitesize subpaths
    "mathsisfun.com",
    "nasa.gov",
    "noaa.gov",
    "mit.edu",
    "harvard.edu",
];

function sanitizeAndSelectResources(raw: unknown): AnswerResource[] | undefined {
    if (!Array.isArray(raw)) return undefined;
    const cleaned: AnswerResource[] = [];

    for (const item of raw) {
        if (!item || typeof item !== "object") continue;
        let title = typeof item.title === "string" ? item.title.trim() : "";
        let url = typeof item.url === "string" ? item.url.trim() : "";
        let source = typeof item.source === "string" ? item.source.trim() : undefined;

        if (title.length < 3) continue;
        if (!/^https:\/\//i.test(url)) continue; // must be https
        try {
            const u = new URL(url);
            // strip tracking params
            const params = u.searchParams;
            [...params.keys()].forEach((k) => { if (/^(utm_|ref|fbclid)/i.test(k)) params.delete(k); });
            u.search = params.toString();
            url = u.origin + u.pathname + (u.search ? `?${u.search}` : "");
            // deduce source if missing
            if (!source) {
                const hostParts = u.hostname.split(".");
                source = hostParts.slice(-2).join("."); // simple domain label
            }
        } catch {
            continue; // invalid URL
        }

        // truncate title to 120 chars at word boundary
        if (title.length > 120) {
            const truncated = title.slice(0, 120);
            const lastSpace = truncated.lastIndexOf(" ");
            title = (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
        }

        cleaned.push({ title, url, source });
    }

    // dedupe by hostname + pathname (normalized lower case, remove trailing slash except root)
    const seen = new Set<string>();
    const deduped = cleaned.filter((r) => {
        try {
            const u = new URL(r.url);
            const key = u.hostname.toLowerCase() + u.pathname.replace(/\/+$/, "");
            if (!key) return false;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        } catch { return false; }
    });

    // rank: allowlisted domains first
    deduped.sort((a, b) => {
        const rank = (r: AnswerResource) => {
            try {
                const u = new URL(r.url);
                const host = u.hostname.toLowerCase();
                return ALLOWLIST_DOMAINS.some((d) => host.includes(d)) ? 0 : 1;
            } catch { return 2; }
        };
        return rank(a) - rank(b);
    });

    if (!deduped.length) return undefined;
    return deduped.slice(0, 3);
}

export function toAskQuestionResponse(raw: string, meta: { latencyMs: number; model: string }): AskQuestionResponse {
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    type ModelShape = {
        answer?: {
            text?: string;
            keyTerms?: unknown;
            examples?: unknown;
            readingLevel?: string;
            resources?: unknown;
        };
    };
    const model = (typeof parsed === "object" && parsed !== null ? parsed as ModelShape : {});
    const answerNode = model.answer ?? {};

    const answer: AskQuestionResponse["answer"] = {
        text: typeof answerNode.text === "string" ? answerNode.text : "I couldn't parse a valid answer.",
        keyTerms: Array.isArray(answerNode.keyTerms) ? answerNode.keyTerms.filter(t => typeof t === "string") as string[] : [],
        examples: Array.isArray(answerNode.examples) ? answerNode.examples.filter(e => typeof e === "string") as string[] : undefined,
        readingLevel: answerNode.readingLevel === "grade9-10" ? "grade9-10" : "grade6-8",
        // resources sanitized below
    };

    const resources = sanitizeAndSelectResources(answerNode.resources);
    if (resources?.length) {
        answer.resources = resources;
    }

    return { answer, metadata: { latencyMs: meta.latencyMs, model: meta.model } };
}
