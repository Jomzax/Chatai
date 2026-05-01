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
