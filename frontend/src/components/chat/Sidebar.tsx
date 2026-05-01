"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Check,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { ChatSession } from "@/types/chat";

type Props = {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
  onDeleteSession: (sessionId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
}: Props) {
  const { currentUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState("jom numduang");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const visibleSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sessions;
    }

    return sessions.filter((session) =>
      session.title.toLowerCase().includes(normalizedQuery)
    );
  }, [query, sessions]);

  useEffect(() => {
    let mounted = true;

    currentUser()
      .then((user) => {
        if (mounted && user?.name) {
          setDisplayName(user.name);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  function startEditing(session: ChatSession) {
    setEditingId(session.id);
    setEditingTitle(session.title);
    setMenuId(null);
  }

  function submitRename(e?: FormEvent) {
    e?.preventDefault();

    if (!editingId) {
      return;
    }

    onRenameSession(editingId, editingTitle);
    setEditingId(null);
    setEditingTitle("");
  }

  function cancelRename() {
    setEditingId(null);
    setEditingTitle("");
  }

  function handleDelete(sessionId: string) {
    onDeleteSession(sessionId);
    setMenuId(null);

    if (editingId === sessionId) {
      cancelRename();
    }
  }

  return (
    <aside className="flex h-screen w-[320px] flex-col border-r border-slate-200 bg-white text-slate-900">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-normal">Chat AI</h1>
        </div>
        <button
          type="button"
          title="ย่อ Sidebar"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1 px-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>แชทใหม่</span>
        </button>

        <label className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-slate-700 transition focus-within:bg-slate-50 hover:bg-slate-50">
          <Search className="h-5 w-5 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาแชท"
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-1">
          {visibleSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            const isEditing = editingId === session.id;
            const isMenuOpen = menuId === session.id;

            return (
              <li key={session.id} className="relative">
                {isEditing ? (
                  <form
                    onSubmit={submitRename}
                    className="flex h-11 items-center gap-2 rounded-lg bg-indigo-50 px-3"
                  >
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => submitRename()}
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                    />
                    <button
                      type="submit"
                      title="บันทึกชื่อ"
                      className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-indigo-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="ยกเลิก"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={cancelRename}
                      className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={`group flex h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-[15px] transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {session.title}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      title="เมนูแชท"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(isMenuOpen ? null : session.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuId(isMenuOpen ? null : session.id);
                        }
                      }}
                      className={`rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 ${
                        isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  </button>
                )}

                {isMenuOpen && !isEditing ? (
                  <div className="absolute right-2 top-10 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => startEditing(session)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      เปลี่ยนชื่อ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(session.id)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบแชท
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        {visibleSessions.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-400">ไม่พบแชท</p>
        ) : null}
      </nav>

      <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-slate-500">Plus</p>
        </div>
        <button
          type="button"
          onClick={logout}
          title="ออกจากระบบ"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
