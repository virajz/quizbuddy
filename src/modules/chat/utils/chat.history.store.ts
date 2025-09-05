// /modules/chat/utils/chat.history.store.ts
// LocalStorage persistence for chat session history (client only)
import type { ChatSessionHistoryEntry, ChatMessage } from "../types/chat.types";

const KEY = "chat_sessions_v1";
const MAX = 10;

export function loadChatHistory(): ChatSessionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSessionHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveChatHistory(list: ChatSessionHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { }
}

export function upsertSession(entry: ChatSessionHistoryEntry) {
  const list = loadChatHistory();
  const existingIdx = list.findIndex(s => s.id === entry.id);
  if (existingIdx >= 0) list[existingIdx] = entry; else list.unshift(entry);
  list.sort((a, b) => b.updatedAt - a.updatedAt);
  saveChatHistory(list);
  return list;
}

export function archiveSession(sessionId: string, messages: ChatMessage[]) {
  const firstUser = messages.find(m => m.role === "user");
  const title = firstUser ? firstUser.content.slice(0, 60) : "Session";
  const entry: ChatSessionHistoryEntry = { id: sessionId, createdAt: Date.now(), updatedAt: Date.now(), messages: messages.filter(m => m.role !== "system"), title };
  return upsertSession(entry);
}
