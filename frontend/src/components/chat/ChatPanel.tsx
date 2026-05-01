"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, UserRound } from "lucide-react";
import { streamChat } from "@/api/chat";
import type { ChatMessage } from "@/types/chat";
import MessageInput from "./MessageInput";

const MAX_CONTEXT_MESSAGES = 8;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(message: string) {
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: message,
      status: "done",
    };
    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: "",
      status: "streaming",
    };
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, assistantMessage]);
    setError("");
    setIsResponding(true);

    try {
      await streamChat({
        messages: nextMessages
          .slice(-MAX_CONTEXT_MESSAGES)
          .map(({ role, content }) => ({ role, content })),
        onChunk: (chunk) => {
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessage.id
                ? { ...item, content: item.content + chunk }
                : item
            )
          );
        },
      });

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id ? { ...item, status: "done" } : item
        )
      );
    } catch (chatError) {
      const message =
        chatError instanceof Error
          ? chatError.message
          : "Unable to get AI response.";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
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
                Welcome back.
              </h1>
              <p className="text-slate-500">
                Ask the assistant anything and the answer will stream in live.
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
                    className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    } ${
                      message.status === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : ""
                    }`}
                  >
                    {message.content}
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
          <MessageInput onSend={handleSend} disabled={isResponding} />
        </div>
      </div>
    </div>
  );
}
