import { QAProvider } from "@/modules/qa/state/QAContext";
import { QAPanel } from "@/modules/qa/components/QAPanel";
import { HistoryPanel } from "@/modules/qa/components/HistoryPanel";

export default function StudyPage() {
    return (
        <main className="mx-auto max-w-5xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">AI Study Buddy — Q&A</h1>
            <QAProvider>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
                    <QAPanel />
                    <HistoryPanel />
                </div>
            </QAProvider>
        </main>
    );
}
