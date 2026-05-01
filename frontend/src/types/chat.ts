import type { UploadedDocument } from "./upload";

export type ChatHistoryItem = {
  id: string;
  title: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  status?: "streaming" | "done" | "error";
  attachments?: UploadedDocument[];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  titleEdited?: boolean;
};

export type Suggestion = {
  id: string;
  title: string;
  description: string;
  icon: "document" | "code" | "lightbulb";
};

export type User = {
  name: string;
  plan: string;
  avatarUrl?: string;
};
