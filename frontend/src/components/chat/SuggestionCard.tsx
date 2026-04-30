import { FileText, TerminalSquare, Lightbulb } from "lucide-react";
import type { Suggestion } from "@/types/chat";

const ICON_MAP = {
  document: { Icon: FileText, bg: "bg-indigo-50", color: "text-indigo-600" },
  code: { Icon: TerminalSquare, bg: "bg-emerald-50", color: "text-emerald-600" },
  lightbulb: { Icon: Lightbulb, bg: "bg-sky-50", color: "text-sky-600" },
};

type Props = {
  suggestion: Suggestion;
  className?: string;
  onClick?: () => void;
};

export default function SuggestionCard({ suggestion, className = "", onClick }: Props) {
  const { Icon, bg, color } = ICON_MAP[suggestion.icon];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition ${className}`}
    >
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-6`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{suggestion.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{suggestion.description}</p>
    </button>
  );
}
