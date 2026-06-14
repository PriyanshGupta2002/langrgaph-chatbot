"use client";

import ThreadPage from "@/components/thread/thread-page";
import { useParams } from "next/navigation";

const ThreadRoutePage = () => {
  const params = useParams();
  const threadId = Array.isArray(params?.thread_id)
    ? params.thread_id[0]
    : params?.thread_id;

  if (!threadId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Invalid thread ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ThreadPage threadId={threadId} />
    </div>
  );
};

export default ThreadRoutePage;
