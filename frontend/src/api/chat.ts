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

function formatRetryAfter(seconds: number) {
  if (seconds < 60) {
    return `${seconds} วินาที`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} นาที`;
  }

  return `${minutes} นาที ${remainingSeconds} วินาที`;
}

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
      | { message?: string; retryAfter?: number }
      | null;
    const retryAfter =
      payload?.retryAfter ??
      Number(response.headers.get("Retry-After") || 0);
    const message = payload?.message ?? "Unable to start AI chat.";

    throw new Error(
      response.status === 429 && retryAfter > 0 && !message.includes("Try again")
        ? `${message} ลองใหม่ได้ในอีก ${formatRetryAfter(retryAfter)}`
        : message
    );
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
