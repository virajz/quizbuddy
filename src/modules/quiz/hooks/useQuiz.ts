// /modules/quiz/hooks/useQuiz.ts
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Quiz, QuizGenerateRequest, QuizGenerateResponse, QuizOptionId, QuestionResult } from "../types/quiz.types";
import { logQuizEvent } from "@/lib/firebase.server";
import { loadQuizHistory, saveQuizHistory } from "../utils/quiz.history.store";

export function useQuiz() {
    // Timer constant
    const QUESTION_TIME_LIMIT_SEC = 45;
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [answers, setAnswers] = useState<Map<string, QuizOptionId>>(new Map());
    const [history, setHistory] = useState<Quiz[]>([]);
    // timing
    const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT_SEC);
    const [isTiming, setIsTiming] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // breakdown results (local) including timeouts
    const [results, setResults] = useState<QuestionResult[]>([]);

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

    const checkCurrent = useCallback((opts?: { dueToTimeout?: boolean }) => {
        if (!quiz) return { correct: false };
        const q = quiz.questions[currentIndex];
        if (!q) return { correct: false };
        if (checked.has(q.id)) return { correct: answers.get(q.id) === q.correctOptionId };
        const chosen = opts?.dueToTimeout ? undefined : answers.get(q.id);
        const correct = !!chosen && chosen === q.correctOptionId;
        setChecked(prev => new Set(prev).add(q.id));
        setResults(prev => [...prev, { questionId: q.id, correct, correctOptionId: q.correctOptionId, selectedOptionId: chosen ?? null, timedOut: !!opts?.dueToTimeout }]);
        stopTimer();
        return { correct };
    }, [quiz, currentIndex, answers, checked]);

    const next = useCallback(() => {
        setCurrentIndex(i => Math.min((quiz?.questions.length ?? 1) - 1, i + 1));
    }, [quiz]);
    const prev = useCallback(() => setCurrentIndex(i => Math.max(0, i - 1)), []);

    const reset = useCallback(() => {
        setQuiz(null); setAnswers(new Map()); setCurrentIndex(0); setChecked(new Set()); setError(null); setTimeLeft(QUESTION_TIME_LIMIT_SEC); setIsTiming(false); if (intervalRef.current) clearInterval(intervalRef.current); setResults([]);
    }, []);

    async function generate(req: QuizGenerateRequest): Promise<QuizGenerateResponse | null> {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/quiz/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
            if (!res.ok) throw new Error(await res.text());
            const json = (await res.json()) as QuizGenerateResponse;
            setQuiz(json.quiz); setCurrentIndex(0); setAnswers(new Map()); setChecked(new Set()); setResults([]); setTimeLeft(QUESTION_TIME_LIMIT_SEC); setIsTiming(false);
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

    // timer controls
    const stopTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsTiming(false);
    }, []);

    const startTimerFor = useCallback((questionId: string) => {
        if (!quiz) return;
        const alreadyChecked = checked.has(questionId);
        stopTimer();
        if (alreadyChecked) { setTimeLeft(QUESTION_TIME_LIMIT_SEC); return; }
        setTimeLeft(QUESTION_TIME_LIMIT_SEC);
        setIsTiming(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // timeout
                    stopTimer();
                    // mark incorrect due to timeout only if not checked
                    const q = quiz.questions.find(q => q.id === questionId);
                    if (q && !checked.has(q.id)) {
                        checkCurrent({ dueToTimeout: true });
                        logQuizEvent({ type: "timed_out", questionId });
                        // auto-advance shortly
                        setTimeout(() => {
                            setCurrentIndex(i => {
                                const lastIdx = (quiz?.questions.length ?? 1) - 1;
                                if (i >= lastIdx) return i; // results will show via finished state
                                return Math.min(lastIdx, i + 1);
                            });
                        }, 450);
                    }
                }
                return prev - 1;
            });
        }, 1000);
    }, [quiz, checked, stopTimer, checkCurrent]);

    const resetTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(QUESTION_TIME_LIMIT_SEC);
    }, [stopTimer]);

    // start/reset on index change
    useEffect(() => {
        if (!quiz) return;
        const q = quiz.questions[currentIndex];
        if (!q) return;
        if (checked.has(q.id)) {
            stopTimer();
            setTimeLeft(QUESTION_TIME_LIMIT_SEC);
            return;
        }
        startTimerFor(q.id);
    }, [currentIndex, quiz, checked, startTimerFor, stopTimer]);

    // cleanup
    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    return { quiz, loading, error, generate, selectOption, checkCurrent, next, prev, reset, currentIndex, answers, checked, finished, grade, history, timeLeft, isTiming, startTimerFor, stopTimer, resetTimer, results };
}
