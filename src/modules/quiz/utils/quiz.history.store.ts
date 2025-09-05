// /modules/quiz/utils/quiz.history.store.ts
import type { Quiz } from "../types/quiz.types";

const KEY = "quiz_history_v1";

export function loadQuizHistory(): Quiz[] {
    if (typeof localStorage === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Quiz[]) : [];
    } catch { return []; }
}

export function saveQuizHistory(quizzes: Quiz[]) {
    if (typeof localStorage === "undefined") return;
    try { localStorage.setItem(KEY, JSON.stringify(quizzes.slice(0, 50))); } catch { }
}
