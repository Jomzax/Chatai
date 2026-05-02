import type { ChatSession } from "@/types/chat";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type ConversationPayload = {
  conversation: ChatSession;
};

type ConversationListPayload = {
  conversations: ChatSession[];
};

async function parseJsonResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? fallbackMessage);
  }

  return payload as T;
}

export async function listConversations() {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    credentials: "include",
  });
  const payload = await parseJsonResponse<ConversationListPayload>(
    response,
    "Unable to load conversations."
  );

  return payload.conversations;
}

export async function createConversation(
  conversation?: Partial<Pick<ChatSession, "title" | "messages" | "titleEdited">>
) {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(conversation ?? {}),
  });
  const payload = await parseJsonResponse<ConversationPayload>(
    response,
    "Unable to create conversation."
  );

  return payload.conversation;
}

export async function updateConversation(
  conversationId: string,
  conversation: Partial<Pick<ChatSession, "title" | "messages" | "titleEdited">>
) {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(conversation),
  });
  const payload = await parseJsonResponse<ConversationPayload>(
    response,
    "Unable to save conversation."
  );

  return payload.conversation;
}

export async function deleteConversation(conversationId: string) {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    credentials: "include",
  });

  await parseJsonResponse<{ message: string }>(
    response,
    "Unable to delete conversation."
  );
}
