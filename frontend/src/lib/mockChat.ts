import type { ChatHistoryItem, Suggestion, User } from "@/types/chat";

export const MOCK_USER: User = {
  name: "Alex Rivera",
  plan: "Pro Account",
};

export const MOCK_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "Design System Sync" },
  { id: "2", title: "Marketing Strategy" },
  { id: "3", title: "Python Refactor" },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    id: "doc",
    title: "Analyze a Document",
    description:
      "Extract insights, summarize findings, or translate complex PDFs and spreadsheets with high precision.",
    icon: "document",
  },
  {
    id: "code",
    title: "Write & Debug Code",
    description:
      "Generate snippets, refactor functions, or solve architectural puzzles across any language.",
    icon: "code",
  },
  {
    id: "brainstorm",
    title: "Brainstorm Strategies",
    description:
      "Outline marketing campaigns, product roadmaps, or creative narratives with AI-driven ideation.",
    icon: "lightbulb",
  },
];
