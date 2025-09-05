// /modules/chat/components/MessageList.tsx
"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat.types";
import { Bot, User } from "lucide-react";

interface MessageListProps { messages: ChatMessage[]; streaming: boolean; }

export function MessageList({ messages, streaming }: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-2" aria-live="polite">
      {messages.filter(m => m.role !== "system").map(m => (
        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed border ${m.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}> 
            <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
              {m.role === "assistant" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              <span>{m.role === "assistant" ? "Assistant" : "You"}</span>
            </div>
            {m.content || (m.role === "assistant" && streaming ? <span className="opacity-50">…</span> : null)}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
