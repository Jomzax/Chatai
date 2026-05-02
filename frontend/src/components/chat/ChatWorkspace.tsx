"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createConversation,
  deleteConversation,
  listConversations,
  updateConversation,
} from "@/api/conversations";
import type { ChatMessage, ChatSession } from "@/types/chat";
import ChatPanel from "./ChatPanel";
import Sidebar from "./Sidebar";

const DEFAULT_TITLE = "แชทใหม่";
const SAVE_DELAY_MS = 500;

function createTitleFromMessage(message: string) {
  const trimmed = message.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return DEFAULT_TITLE;
  }

  return trimmed.length > 34 ? `${trimmed.slice(0, 34)}...` : trimmed;
}

export default function ChatWorkspace() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [syncError, setSyncError] = useState("");
  const saveTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const saveTimers = saveTimersRef.current;

    async function loadSessions() {
      try {
        const storedSessions = await listConversations();
        const initialSessions =
          storedSessions.length > 0
            ? storedSessions
            : [await createConversation({ title: DEFAULT_TITLE })];

        if (!mounted) {
          return;
        }

        setSessions(initialSessions);
        setActiveSessionId(initialSessions[0].id);
        setSyncError("");
      } catch (error) {
        if (mounted) {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Unable to load conversations."
          );
        }
      } finally {
        if (mounted) {
          setHasLoaded(true);
        }
      }
    }

    loadSessions();

    return () => {
      mounted = false;
      Object.values(saveTimers).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const activeSession = useMemo(
    () =>
      sessions.find((session) => session.id === activeSessionId) ??
      sessions[0] ??
      null,
    [activeSessionId, sessions]
  );

  function queueSaveSession(session: ChatSession) {
    window.clearTimeout(saveTimersRef.current[session.id]);
    saveTimersRef.current[session.id] = window.setTimeout(() => {
      updateConversation(session.id, {
        title: session.title,
        messages: session.messages,
        titleEdited: session.titleEdited,
      })
        .then(() => setSyncError(""))
        .catch((error) => {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Unable to save conversation."
          );
        });
    }, SAVE_DELAY_MS);
  }

  async function ensureConversationExists() {
    const session = await createConversation({ title: DEFAULT_TITLE });
    setSessions([session]);
    setActiveSessionId(session.id);
  }

  async function handleNewChat() {
    try {
      const session = await createConversation({ title: DEFAULT_TITLE });

      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
      setSyncError("");
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Unable to create conversation."
      );
    }
  }

  function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId);
  }

  function handleRenameSession(sessionId: string, title: string) {
    const nextTitle = title.trim() || DEFAULT_TITLE;

    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        const updatedSession = {
          ...session,
          title: nextTitle,
          titleEdited: true,
          updatedAt: Date.now(),
        };

        queueSaveSession(updatedSession);
        return updatedSession;
      })
    );
  }

  function handleDeleteSession(sessionId: string) {
    window.clearTimeout(saveTimersRef.current[sessionId]);
    delete saveTimersRef.current[sessionId];

    setSessions((current) => {
      const remaining = current.filter((session) => session.id !== sessionId);

      if (sessionId === activeSessionId) {
        setActiveSessionId(remaining[0]?.id ?? "");
      }

      return remaining;
    });

    deleteConversation(sessionId)
      .then(async () => {
        setSyncError("");
        const remainingSessions = await listConversations();

        if (remainingSessions.length === 0) {
          await ensureConversationExists();
          return;
        }

        setSessions(remainingSessions);
        setActiveSessionId((current) => current || remainingSessions[0].id);
      })
      .catch((error) => {
        setSyncError(
          error instanceof Error ? error.message : "Unable to delete conversation."
        );
      });
  }

  function handleMessagesChange(
    messages: ChatMessage[],
    options: { persist?: boolean } = {}
  ) {
    if (!activeSession) {
      return;
    }

    setSessions((current) => {
      const updatedAt = Date.now();
      let updatedSession: ChatSession | null = null;
      const nextSessions = current
        .map((session) => {
          if (session.id !== activeSession.id) {
            return session;
          }

          const firstUserMessage = messages.find(
            (message) => message.role === "user"
          );

          updatedSession = {
            ...session,
            title:
              session.titleEdited || !firstUserMessage
                ? session.title
                : createTitleFromMessage(firstUserMessage.content),
            messages,
            updatedAt,
          };

          return updatedSession;
        })
        .sort((a, b) => b.updatedAt - a.updatedAt);

      if (updatedSession && options.persist !== false) {
        queueSaveSession(updatedSession);
      }

      return nextSessions;
    });
  }

  if (!hasLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        กำลังโหลดประวัติแชท...
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-red-600">
        {syncError || "Unable to load conversations."}
      </div>
    );
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
        {syncError ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-700">
            {syncError}
          </div>
        ) : null}
        <ChatPanel
          key={activeSession.id}
          messages={activeSession.messages}
          onMessagesChange={handleMessagesChange}
        />
      </main>
    </div>
  );
}
