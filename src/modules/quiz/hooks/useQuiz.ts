// /modules/quiz/hooks/useQuiz.ts
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Quiz, QuizGenerateRequest, QuizGenerateResponse, QuizOptionId } from "../types/quiz.types";
import { loadQuizHistory, saveQuizHistory } from "../utils/quiz.history.store";

export function useQuiz() {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [answers, setAnswers] = useState<Map<string, QuizOptionId>>(new Map());
    const [history, setHistory] = useState<Quiz[]>([]);

    useEffect(() => { setHistory(loadQuizHistory()); }, []);

    function pushHistory(q: Quiz) {
        setHistory(prev => {
            const next = [q, ...prev];
            saveQuizHistory(next);
            return next;
        });
    }

    const selectOption = useCallback((questionId: string, optionId: QuizOptionId) => {
        setAnswers(prev => new Map(prev).set(questionId, optionId));
    }, []);

    const checkCurrent = useCallback(() => {
        if (!quiz) return { correct: false };
        const q = quiz.questions[currentIndex];
        if (!q) return { correct: false };
        const chosen = answers.get(q.id);
        const correct = chosen === q.correctOptionId;
        setChecked(prev => new Set(prev).add(q.id));
        return { correct };
    }, [quiz, currentIndex, answers]);

    const next = useCallback(() => {
        setCurrentIndex(i => Math.min((quiz?.questions.length ?? 1) - 1, i + 1));
    }, [quiz]);
    const prev = useCallback(() => setCurrentIndex(i => Math.max(0, i - 1)), []);

    const reset = useCallback(() => {
        setQuiz(null); setAnswers(new Map()); setCurrentIndex(0); setChecked(new Set()); setError(null);
    }, []);

    async function generate(req: QuizGenerateRequest): Promise<QuizGenerateResponse | null> {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/quiz/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
            if (!res.ok) throw new Error(await res.text());
            const json = (await res.json()) as QuizGenerateResponse;
            setQuiz(json.quiz); setCurrentIndex(0); setAnswers(new Map()); setChecked(new Set());
            pushHistory(json.quiz);
            return json;
        } catch (e: any) {
            setError(e?.message ?? "Failed to generate quiz");
            return null;
        } finally { setLoading(false); }
    }

    const finished = useMemo(() => quiz && checked.size === 5, [quiz, checked]);

    const grade = useCallback(async () => {
        if (!quiz) return null;
        const answersArr = quiz.questions.map(q => ({ questionId: q.id, selectedOptionId: answers.get(q.id)! })).filter(a => !!a.selectedOptionId);
        try {
            // fire-and-forget logging; result not strictly needed since we can compute locally
            fetch("/api/quiz/grade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId: quiz.id, answers: answersArr }) }).catch(() => { });
        } catch { }
        const score = quiz.questions.reduce((acc, q) => acc + (answers.get(q.id) === q.correctOptionId ? 1 : 0), 0);
        return { score };
    }, [quiz, answers]);

    return { quiz, loading, error, generate, selectOption, checkCurrent, next, prev, reset, currentIndex, answers, checked, finished, grade, history };
}
