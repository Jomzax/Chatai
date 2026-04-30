"use client";

import { useState } from "react";
import { Bot, Plus, MessageSquare, UserCircle2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_HISTORY, MOCK_USER } from "@/lib/mockChat";

export default function Sidebar() {
  const { logout } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900">AI Assistant</span>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          แชทใหม่
        </button>
      </div>

      <div className="px-5 mt-6 mb-2">
        <p className="text-xs font-bold text-slate-400 tracking-widest">
          ประวัติการแชท
        </p>
        <p className="text-xs text-slate-400 mt-0.5">7 วันล่าสุด</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {MOCK_HISTORY.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => setActiveId(chat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeId === chat.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left">{chat.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-200 px-4 py-4 flex items-center gap-3">
        <UserCircle2 className="w-9 h-9 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {MOCK_USER.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{MOCK_USER.plan}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          title="ออกจากระบบ"
          className="text-slate-400 hover:text-slate-700 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
