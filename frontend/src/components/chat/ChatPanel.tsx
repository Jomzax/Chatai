"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, UserRound } from "lucide-react";
import { streamChat } from "@/api/chat";
import type { ChatMessage } from "@/types/chat";
import type { UploadedDocument } from "@/types/upload";
import MarkdownMessage from "./MarkdownMessage";
import MessageInput from "./MessageInput";

const MAX_CONTEXT_MESSAGES = 1000; //กำหนดจำนวนข้อความสูงสุดที่จะส่งไปยังโมเดลในแต่ละรอบแชท
const MAX_SESSION_TOKENS = 30000;  //กำหนดจำนวน tokens สูงสุดที่อนุญาตในแชทหนึ่งครั้ง
const TOKEN_RESET_MS = 5 * 60 * 1000; //กำหนดเวลาที่ต้องรอก่อนที่จะรีเซ็ตจำนวน tokens (ในที่นี้คือ 5 นาที)

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const TOKEN_RESET_STORAGE_KEY = "chatai.token-reset.v1";

type Props = {
  sessionId: string;
  messages: ChatMessage[];
  onMessagesChange: (
    messages: ChatMessage[],
    options?: { persist?: boolean }
  ) => void;
};

type TokenResetState = {
  baseline: number;
  resetAt: number;
};

function estimateMessageTokens(message: string) {
  return Math.ceil(message.length / 4);
}

function estimateTokens(messages: ChatMessage[]) {
  const totalCharacters = messages.reduce(
    (total, message) => total + message.content.length,
    0
  );

  return Math.ceil(totalCharacters / 4);
}

function readStoredTokenReset(
  sessionId: string,
  messages: ChatMessage[]
): TokenResetState {
  if (typeof window === "undefined") {
    return { baseline: 0, resetAt: 0 };
  }

  try {
    const payload = window.localStorage.getItem(TOKEN_RESET_STORAGE_KEY);
    const stored = payload
      ? (JSON.parse(payload) as Record<string, TokenResetState>)
      : {};
    const state = stored[sessionId] || { baseline: 0, resetAt: 0 };
    const currentTokens = estimateTokens(messages);
    const nextState =
      state.resetAt && Date.now() >= state.resetAt
        ? { baseline: currentTokens, resetAt: 0 }
        : {
            baseline: Math.min(state.baseline || 0, currentTokens),
            resetAt: Number(state.resetAt || 0),
          };

    stored[sessionId] = nextState;
    window.localStorage.setItem(TOKEN_RESET_STORAGE_KEY, JSON.stringify(stored));
    return nextState;
  } catch {
    return { baseline: 0, resetAt: 0 };
  }
}

function writeStoredTokenReset(sessionId: string, state: TokenResetState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload = window.localStorage.getItem(TOKEN_RESET_STORAGE_KEY);
    const stored = payload
      ? (JSON.parse(payload) as Record<string, TokenResetState>)
      : {};

    stored[sessionId] = state;
    window.localStorage.setItem(TOKEN_RESET_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore storage failures; the in-memory timer still works for this tab.
  }
}

function formatResetClock(timestamp: number) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} วินาที`;
  }

  if (seconds === 0) {
    return `${minutes} นาที`;
  }

  return `${minutes} นาที ${seconds} วินาที`;
}

function uniqueDocuments(documents: UploadedDocument[]) {
  const seen = new Set<string>();

  return documents
    .filter((document) => document.id)
    .filter((document) => {
      if (seen.has(document.id)) {
        return false;
      }

      seen.add(document.id);
      return true;
    })
    .slice(0, 5);
}

function getSessionDocuments(messages: ChatMessage[]) {
  return uniqueDocuments(
    messages.flatMap((message) => message.attachments || [])
  );
}

function getLatestAttachedDocuments(messages: ChatMessage[]) {
  return (
    [...messages]
      .reverse()
      .find((message) => (message.attachments || []).length > 0)
      ?.attachments || []
  );
}

function shouldUseAllDocuments(message: string) {
  const normalized = message.toLowerCase();

  return [
    "ทั้งหมด",
    "ทุกไฟล์",
    "ทุกเอกสาร",
    "รวมทุก",
    "all files",
    "all documents",
  ].some((keyword) => normalized.includes(keyword));
}

function collectTargetDocuments({
  messages,
  attachments,
  message,
}: {
  messages: ChatMessage[];
  attachments: UploadedDocument[];
  message: string;
}) {
  if (shouldUseAllDocuments(message)) {
    return uniqueDocuments([...getSessionDocuments(messages), ...attachments]);
  }

  if (attachments.length > 0) {
    return uniqueDocuments(attachments);
  }

  return uniqueDocuments(getLatestAttachedDocuments(messages));
}

export default function ChatPanel({
  sessionId,
  messages,
  onMessagesChange,
}: Props) {
  const [error, setError] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [tokenBaseline, setTokenBaseline] = useState(0);
  const [tokenResetAt, setTokenResetAt] = useState(0);
  const [hasLoadedTokenReset, setHasLoadedTokenReset] = useState(false);
  const [now, setNow] = useState(0);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const rawTokenTotal = estimateTokens(messages);
  const activeTokenTotal = Math.max(
    0,
    rawTokenTotal - Math.min(tokenBaseline, rawTokenTotal)
  );
  const tokenTotal = Math.min(MAX_SESSION_TOKENS, activeTokenTotal);
  const isSessionLimitReached = activeTokenTotal >= MAX_SESSION_TOKENS;
  const tokenResetText = tokenResetAt
    ? `รีเวลา ${formatResetClock(tokenResetAt)} (อีก ${formatCountdown(
        tokenResetAt - now
      )})`
    : "";

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedState = readStoredTokenReset(sessionId, messages);

      setTokenBaseline(storedState.baseline);
      setTokenResetAt(storedState.resetAt);
      setNow(Date.now());
      setHasLoadedTokenReset(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [messages, sessionId]);

  useEffect(() => {
    if (!hasLoadedTokenReset || !isSessionLimitReached || tokenResetAt) {
      return;
    }

    const timer = window.setTimeout(() => {
      const currentTime = Date.now();
      const nextResetAt = currentTime + TOKEN_RESET_MS;

      setNow(currentTime);
      setTokenResetAt(nextResetAt);
      writeStoredTokenReset(sessionId, {
        baseline: tokenBaseline,
        resetAt: nextResetAt,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    hasLoadedTokenReset,
    isSessionLimitReached,
    sessionId,
    tokenBaseline,
    tokenResetAt,
  ]);

  useEffect(() => {
    if (!tokenResetAt) {
      return;
    }

    const countdownTimer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    const resetTimer = window.setTimeout(() => {
      const nextBaseline = estimateTokens(messages);

      setTokenBaseline(nextBaseline);
      setTokenResetAt(0);
      setError("");
      writeStoredTokenReset(sessionId, {
        baseline: nextBaseline,
        resetAt: 0,
      });
    }, Math.max(0, tokenResetAt - Date.now()));

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(resetTimer);
    };
  }, [messages, sessionId, tokenResetAt]);

  async function handleSend(
    message: string,
    attachments: UploadedDocument[] = []
  ) {
    const text = message.trim();
    const nextMessageContent =
      text ||
      `Uploaded ${attachments.length} file${attachments.length === 1 ? "" : "s"}.`;

    if (
      activeTokenTotal + estimateMessageTokens(nextMessageContent) >
      MAX_SESSION_TOKENS
    ) {
      const nextResetAt = tokenResetAt || Date.now() + TOKEN_RESET_MS;

      if (!tokenResetAt) {
        setTokenResetAt(nextResetAt);
        writeStoredTokenReset(sessionId, {
          baseline: tokenBaseline,
          resetAt: nextResetAt,
        });
      }

      setError(
        `แชทนี้เต็ม ${MAX_SESSION_TOKENS} tokens แล้ว จะรีเวลา ${formatResetClock(
          nextResetAt
        )} (อีก ${formatCountdown(nextResetAt - Date.now())})`
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: nextMessageContent,
      status: "done",
      attachments,
    };
    const nextMessages = [...messages, userMessage];

    if (!text) {
      onMessagesChange(nextMessages);
      setError("");
      return;
    }

    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: "",
      status: "streaming",
    };

    onMessagesChange(nextMessages);
    onMessagesChange([...nextMessages, assistantMessage], { persist: false });
    setError("");
    setIsResponding(true);
    const targetDocuments = collectTargetDocuments({
      messages,
      attachments,
      message: text,
    });

    try {
      await streamChat({
        messages: nextMessages
          .slice(-MAX_CONTEXT_MESSAGES)
          .map(({ role, content }) => ({ role, content })),
        documentIds: targetDocuments.map((document) => document.id),
        documents: targetDocuments,
        onChunk: (chunk) => {
          onMessagesChange(
            [...nextMessages, assistantMessage].map((item) =>
              item.id === assistantMessage.id
                ? { ...item, content: item.content + chunk }
                : item
            ),
            { persist: false }
          );

          assistantMessage.content += chunk;
        },
      });

      onMessagesChange(
        [...nextMessages, assistantMessage].map((item) =>
          item.id === assistantMessage.id ? { ...item, status: "done" } : item
        )
      );
    } catch (chatError) {
      const message =
        chatError instanceof Error
          ? chatError.message
          : "Unable to get AI response.";
      setError(message);
      onMessagesChange(
        [...nextMessages, assistantMessage].map((item) =>
          item.id === assistantMessage.id
            ? {
              ...item,
              content: item.content || message,
              status: "error",
            }
            : item
        )
      );
    } finally {
      setIsResponding(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-10 py-12">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900">
                วันนี้ให้ช่วยอะไรดี
              </h1>
              <p className="text-slate-500">
                เริ่มแชทใหม่หรือค้นหาแชทเก่าจาก sidebar ได้เลย
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.role === "assistant" ? (
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                      } ${message.status === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : ""
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownMessage content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                    {message.attachments?.length ? (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`rounded-xl px-3 py-2 text-xs ${message.role === "user"
                                ? "bg-white/15 text-white"
                                : "bg-slate-50 text-slate-600"
                              }`}
                          >
                            <div className="font-medium">
                              {attachment.originalName}
                            </div>
                            <div className="mt-0.5 opacity-80">
                              {(attachment.size / 1024).toFixed(1)} KB
                              {attachment.textLength
                                ? ` · ${attachment.textLength.toLocaleString()} chars indexed`
                                : ""}
                              {attachment.extractionStatus === "failed"
                                ? " · text extraction failed"
                                : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {message.status === "streaming" ? (
                      <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />
                    ) : null}
                  </div>

                  {message.role === "user" ? (
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <UserRound className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
              ))}
              <div ref={scrollAnchorRef} />
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-slate-10 px-10 py-3">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <MessageInput
            onSend={handleSend}
            disabled={isResponding || isSessionLimitReached}
            disabledReason={
              isSessionLimitReached
                ? `แชทนี้เต็ม ${MAX_SESSION_TOKENS} tokens แล้ว ${tokenResetText}`
                : ""
            }
            tokenTotal={tokenTotal}
            tokenLimit={MAX_SESSION_TOKENS}
          />
        </div>
      </div>
    </div>
  );
}
