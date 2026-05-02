"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, UserRound } from "lucide-react";
import { streamChat } from "@/api/chat";
import type { ChatMessage } from "@/types/chat";
import type { UploadedDocument } from "@/types/upload";
import MarkdownMessage from "./MarkdownMessage";
import MessageInput from "./MessageInput";

const MAX_CONTEXT_MESSAGES = 8;
const MAX_SESSION_TOKENS = 3000;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

type Props = {
  messages: ChatMessage[];
  onMessagesChange: (
    messages: ChatMessage[],
    options?: { persist?: boolean }
  ) => void;
};

function estimateTokens(messages: ChatMessage[]) {
  const totalCharacters = messages.reduce(
    (total, message) => total + message.content.length,
    0
  );

  return Math.min(MAX_SESSION_TOKENS, Math.ceil(totalCharacters / 4));
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

export default function ChatPanel({ messages, onMessagesChange }: Props) {
  const [error, setError] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const tokenTotal = estimateTokens(messages);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(
    message: string,
    attachments: UploadedDocument[] = []
  ) {
    const text = message.trim();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content:
        text ||
        `Uploaded ${attachments.length} file${
          attachments.length === 1 ? "" : "s"
        }.`,
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
      <div className="flex-1 overflow-y-auto px-10 py-12">
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
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    } ${
                      message.status === "error"
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
                            className={`rounded-xl px-3 py-2 text-xs ${
                              message.role === "user"
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

      <div className="border-t border-slate-200 bg-slate-50 px-10 py-5">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <MessageInput
            onSend={handleSend}
            disabled={isResponding}
            tokenTotal={tokenTotal}
            tokenLimit={MAX_SESSION_TOKENS}
          />
        </div>
      </div>
    </div>
  );
}
