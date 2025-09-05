// /app/study/page.tsx
import { QAPageShell } from "@/modules/qa/components/QAPanel";

export default function StudyPage() {
    return (
        <main className="mx-auto max-w-5xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">AI Study Buddy — Q&A</h1>
            <QAPageShell />
        </main>
    );
}
