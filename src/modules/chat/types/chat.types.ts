// /modules/chat/types/chat.types.ts
// Shared data contracts for the brainstorming chat module (Module 3)
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number; // epoch ms
}

export interface ChatRequest {
  messages: ChatMessage[]; // excludes the system prompt (server adds it)
  sessionId: string;
}

export interface ChatStreamChunk {
  content: string;
  done?: boolean;
  error?: string;
}

export interface TranscribeRequest {
  audioMime: "audio/webm" | "audio/ogg" | "audio/wav";
  base64: string; // raw audio bytes in base64 (no data: prefix expected)
}

export interface TranscribeResponse {
  text: string;
  language?: string;
}

// Local session shape for persistence
export interface ChatSessionHistoryEntry {
  id: string; // sessionId
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[]; // includes user + assistant only (no system)
  title?: string; // optional derived first user message snippet
}
