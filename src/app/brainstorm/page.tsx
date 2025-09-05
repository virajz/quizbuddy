// /app/brainstorm/page.tsx

import { ChatPanel } from "@/modules/chat/components/ChatPanel";


export const metadata = { title: "Brainstorm Chat" };

export default function BrainstormPage() {
    return (
        <main className="flex flex-col flex-1 p-4 h-[calc(100dvh-4rem)]">
            <ChatPanel />
        </main>
    );
}
