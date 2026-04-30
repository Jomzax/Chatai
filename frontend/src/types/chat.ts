export type ChatHistoryItem = {
  id: string;
  title: string;
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
