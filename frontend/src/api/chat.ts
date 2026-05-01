import type { ChatMessage } from "@/types/chat";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000/api";

type StreamChatOptions = {
  messages: Pick<ChatMessage, "role" | "content">[];
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
};

export async function streamChat({
  messages,
  signal,
  onChunk,
}: StreamChatOptions) {
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? "Unable to start AI chat.");
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("AI response stream is unavailable.");
  }

  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    onChunk(decoder.decode(value, { stream: true }));
  }
}
