"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateThread } from "@/services/threads/thread.query";
import ChatInput from "@/components/chat/chat-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ChatPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createThreadMutation = useCreateThread();
  const { mutate, isPending } = createThreadMutation;

  const handleSend = (text: string) => {
    setErrorMessage(null);
    mutate(text, {
      onSuccess: (response) => {
        const threadId = response?.data?.thread_id;
        if (threadId) {
          router.replace(`/thread/${threadId}?q=${encodeURIComponent(text)}`);
          return;
        }
        setErrorMessage("Unable to start a new chat. Please try again.");
      },
      onError: () => {
        setErrorMessage("Unable to start a new chat. Please try again.");
      },
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <Card className="overflow-hidden rounded-[2rem] border border-border shadow-sm">
          <CardHeader className="space-y-3 border-b border-border/70 p-8 bg-background">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Start a new chat
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Ask anything and get a fast, helpful reply.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Type your question below to open a new conversation thread. The
              assistant will reply directly in the new chat.
            </p>
          </CardHeader>
          <CardContent className="bg-muted/5 p-6">
            <div className="rounded-[1.5rem] border border-muted/40 bg-card p-6 shadow-sm">
              <ChatInput
                onSend={handleSend}
                isSending={createThreadMutation.isPending}
              />
              {errorMessage ? (
                <div className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}
              <div className="mt-5 rounded-2xl border border-muted/40 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                Type your question and tap the send icon to start a new thread.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
