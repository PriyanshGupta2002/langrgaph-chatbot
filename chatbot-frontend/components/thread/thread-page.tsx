"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useThread, useThreadMessages } from "@/services/threads/thread.query";
import ChatContainer from "@/components/chat/chat-container";
import ChatHeader from "@/components/chat/chat-header";

interface ThreadPageProps {
  threadId: string;
}

const ThreadPage = ({ threadId }: ThreadPageProps) => {
  const router = useRouter();
  const { data: threadData, isLoading: threadLoading } = useThread(threadId);
  const { data: messagesData, isLoading: messagesLoading } =
    useThreadMessages(threadId);

  const searchParams = useSearchParams();
  const qParam = searchParams?.get("q");
  const [initialPrompt, setInitialPrompt] = useState<string | null>(
    qParam ?? null,
  );

  useEffect(() => {
    if (!threadId) {
      router.push("/chat");
    }
  }, [router, threadId]);

  useEffect(() => {
    if (!qParam) return;
    // remove query param from URL while keeping state so we don't resend on refresh
    router.replace(`/thread/${threadId}`);
  }, [qParam, router, threadId]);

  if (threadLoading || messagesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!threadData?.data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Thread not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-3 p-4">
      <ChatHeader title={threadData.data.title} threadId={threadId} />
      <ChatContainer
        threadId={threadId}
        initialMessages={messagesData?.data ?? []}
        initialPrompt={initialPrompt}
      />
    </div>
  );
};

export default ThreadPage;
