// /modules/chat/utils/chat.prompts.ts
import "server-only";

export const SYSTEM_BRAINSTORM_PROMPT = `You are a collaborative study buddy for brainstorming and discussion. Keep replies clear, focused, and helpful. Maintain context from previous messages. Ask a brief clarifying question only when ambiguity blocks progress. No code unless asked. No external links unless explicitly requested. Text only.`;

/**
 * Build the final messages array passed to Groq, performing simple rolling context + summarization.
 * Summarization heuristic: keep last <=16 messages OR roughly last 8k characters. Older ones
 * are concatenated and compressed into a single system note: "Context summary: ...".
 */
export function buildRollingContext(original: { messages: { role: string; content: string }[] }) {
  const MAX_MSG = 16;
  const MAX_CHARS = 8000; // crude proxy for ~8k tokens upper bound (conservative)
  const msgs = [...original.messages];
  if (msgs.length <= MAX_MSG && msgs.reduce((a, m) => a + m.content.length, 0) < MAX_CHARS) {
    return [ { role: "system", content: SYSTEM_BRAINSTORM_PROMPT }, ...msgs ];
  }
  // Need summarization: separate recent tail and older head
  const tail: { role: string; content: string }[] = [];
  let charCount = 0;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (tail.length < MAX_MSG && charCount + m.content.length < MAX_CHARS) {
      tail.unshift(m);
      charCount += m.content.length;
    } else break;
  }
  const preservedStartCount = msgs.length - tail.length;
  const older = msgs.slice(0, preservedStartCount);
  const summary = older.map(m => `${m.role === "user" ? "U" : "A"}: ${truncate(m.content, 280)}`).join("\n");
  const systemSummary = `Context summary (earlier turns, compressed):\n${summary}`;
  return [
    { role: "system", content: SYSTEM_BRAINSTORM_PROMPT },
    { role: "system", content: systemSummary },
    ...tail,
  ];
}

function truncate(str: string, n: number) { return str.length > n ? str.slice(0, n - 1) + "…" : str; }
