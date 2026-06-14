"use client";

import React, { useRef, useState } from "react";
import MessageBox from "./message-box";
import ChatInput from "./chat-input";
import { MessageResponse } from "@/types/thread.types";
import { streamChat } from "@/services/chat/chat.api";

function genId(prefix = "msg") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ChatContainerProps {
  threadId?: string;
  initialMessages?: MessageResponse[];
  initialPrompt?: string | null;
}

const ChatContainer = ({
  threadId,
  initialMessages,
  initialPrompt = null,
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<MessageResponse[]>(
    initialMessages ?? [],
  );
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const initialSentRef = useRef(false);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = React.useCallback(
    async (text: string) => {
      const userMsg: MessageResponse = {
        message_id: genId("user"),
        content: text,
        role: "user",
        thread_id: threadId ?? "",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((m) => [...m, userMsg]);

      const assistantId = genId("assistant");
      const assistantMsg: MessageResponse = {
        message_id: assistantId,
        content: "",
        role: "assistant",
        thread_id: threadId ?? "",
        status: "streaming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);
      setIsSending(true);

      try {
        await streamChat(
          { thread_id: threadId ?? null, message: text },
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === assistantId
                  ? { ...msg, content: msg.content + chunk }
                  : msg,
              ),
            );
          },
          () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === assistantId
                  ? { ...msg, status: "completed" }
                  : msg,
              ),
            );
            setIsSending(false);
          },
          (err) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === assistantId
                  ? { ...msg, status: "failed" }
                  : msg,
              ),
            );
            setIsSending(false);
            console.error("stream error", err);
          },
        );
      } catch {
        setIsSending(false);
      }

      // ✅ Fallback: if onDone never fired (backend closed without event:done)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === assistantId && msg.status === "streaming"
            ? { ...msg, status: "completed" }
            : msg,
        ),
      );
    },
    [threadId],
  );

  React.useEffect(() => {
    if (!initialPrompt) return;
    if (initialSentRef.current) return;
    initialSentRef.current = true;
    void handleSend(initialPrompt);
  }, [initialPrompt, handleSend]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBox key={message.message_id} {...message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="shrink-0 border-t border-border/70 bg-background p-4">
        <ChatInput onSend={handleSend} isSending={isSending} />
      </div>
    </div>
  );
};

export default ChatContainer;
