"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import ChatPanel from "./ChatPanel";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "chatai.sessions.v1";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const createSession = (): ChatSession => {
  const now = Date.now();

  return {
    id: createId(),
    title: "แชทใหม่",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
};

function readStoredSessions() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);
    const parsed = payload ? (JSON.parse(payload) as ChatSession[]) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createTitleFromMessage(message: string) {
  const trimmed = message.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "แชทใหม่";
  }

  return trimmed.length > 34 ? `${trimmed.slice(0, 34)}...` : trimmed;
}

export default function ChatWorkspace() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedSessions = readStoredSessions();
      const initialSessions =
        storedSessions.length > 0 ? storedSessions : [createSession()];

      setSessions(initialSessions);
      setActiveSessionId(initialSessions[0].id);
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [hasLoaded, sessions]);

  const activeSession = useMemo(
    () =>
      sessions.find((session) => session.id === activeSessionId) ??
      sessions[0] ??
      null,
    [activeSessionId, sessions]
  );

  function handleNewChat() {
    const session = createSession();

    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
  }

  function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId);
  }

  function handleRenameSession(sessionId: string, title: string) {
    const nextTitle = title.trim() || "แชทใหม่";

    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
            ...session,
            title: nextTitle,
            titleEdited: true,
            updatedAt: Date.now(),
          }
          : session
      )
    );
  }

  function handleDeleteSession(sessionId: string) {
    setSessions((current) => {
      const remaining = current.filter((session) => session.id !== sessionId);
      const nextSessions = remaining.length > 0 ? remaining : [createSession()];

      if (sessionId === activeSessionId) {
        setActiveSessionId(nextSessions[0].id);
      }

      return nextSessions;
    });
  }

  function handleMessagesChange(messages: ChatMessage[]) {
    if (!activeSession) {
      return;
    }

    setSessions((current) => {
      const updatedAt = Date.now();

      return current
        .map((session) => {
          if (session.id !== activeSession.id) {
            return session;
          }

          const firstUserMessage = messages.find(
            (message) => message.role === "user"
          );

          return {
            ...session,
            title:
              session.titleEdited || !firstUserMessage
                ? session.title
                : createTitleFromMessage(firstUserMessage.content),
            messages,
            updatedAt,
          };
        })
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  if (!hasLoaded || !activeSession) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="flex flex-col-1 mt-0 min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession.id}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex min-h-screen flex-1 flex-col bg-slate-50">
        <ChatPanel
          key={activeSession.id}
          messages={activeSession.messages}
          onMessagesChange={handleMessagesChange}
        />
      </main>


    </div>
  );
}
