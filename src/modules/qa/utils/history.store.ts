// /modules/qa/utils/history.store.ts
const KEY = "qa_history_v1";

import type { HistoryEntry } from "../types/qa.types";

export function loadHistory(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch { return []; }
}

export function saveHistory(entries: HistoryEntry[]) {
    try { localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 200))); } catch { }
}
