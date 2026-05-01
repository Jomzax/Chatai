import type { ChatMessage } from "@/types/chat";
import type { UploadedDocument } from "@/types/upload";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type StreamChatOptions = {
  messages: Pick<ChatMessage, "role" | "content">[];
  documentIds?: string[];
  documents?: UploadedDocument[];
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
};

export async function streamChat({
  messages,
  documentIds = [],
  documents = [],
  signal,
  onChunk,
}: StreamChatOptions) {
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ messages, documentIds, documents }),
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
