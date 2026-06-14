"use client";
import React, { FC, useState } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ThreadResponse } from "@/types/thread.types";
import { useRouter } from "next/navigation";
import ThreadMenu from "./thread-menu";

interface ThreadListProps {
  threads?: ThreadResponse[];
  activeThreadId?: string;
}
const ThreadList: FC<ThreadListProps> = ({ threads, activeThreadId }) => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!threads?.length) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No recent chats yet. Start a new chat to create a thread.
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <SidebarMenuItem
            key={thread.thread_id}
            onMouseEnter={() => setHoveredId(thread.thread_id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-center gap-2 w-full">
              <SidebarMenuButton
                type="button"
                isActive={thread.thread_id === activeThreadId}
                onClick={() => router.push(`/thread/${thread.thread_id}`)}
                className="flex-1"
              >
                {thread.title}
              </SidebarMenuButton>
              {hoveredId === thread.thread_id && (
                <ThreadMenu
                  threadId={thread.thread_id}
                  threadTitle={thread.title}
                />
              )}
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default ThreadList;
