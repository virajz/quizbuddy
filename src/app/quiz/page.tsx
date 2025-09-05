// /app/quiz/page.tsx
import { QuizForm } from "@/modules/quiz/components/QuizForm";
import { QuizRunner } from "@/modules/quiz/components/QuizRunner";
import { QuizProvider } from "@/modules/quiz/state/QuizContext";

export default function QuizPage() {
    return (
        <main className="mx-auto max-w-5xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Quiz</h1>
            <QuizProvider>
                <div className="grid gap-6 md:grid-cols-[380px_1fr]">
                    <div><QuizForm /></div>
                    <div>
                        <QuizRunner />
                    </div>
                </div>
            </QuizProvider>
        </main>
    );
}
