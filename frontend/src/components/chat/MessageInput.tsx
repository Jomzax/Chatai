"use client";

import { useState, FormEvent } from "react";
import { Paperclip, Mic, Send } from "lucide-react";

type Props = {
  onSend?: (message: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2 px-3 py-2"
    >
      <button
        type="button"
        title="แนบไฟล์"
        className="p-2 text-slate-400 hover:text-slate-600 transition"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ส่งข้อความให้ AI Assistant…"
        className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
      />
      <button
        type="button"
        title="พูด"
        className="p-2 text-slate-400 hover:text-slate-600 transition"
      >
        <Mic className="w-5 h-5" />
      </button>
      <button
        type="submit"
        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
