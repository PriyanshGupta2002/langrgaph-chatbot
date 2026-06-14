"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useThreads } from "@/services/threads/thread.query";
import { BotIcon, PencilIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ThreadList from "../thread/thread-list";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: threadData } = useThreads();
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const activeThreadId = pathname?.match(/^\/thread\/([^/]+)/)?.[1];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
          <span className="group-data-[collapsible=icon]:hidden">
            CoderBot.AI
          </span>
          <BotIcon className="w-5 h-5 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={() => router.push("/chat")}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between gap-2 cursor-pointer group-data-[collapsible=icon]:justify-center"
                >
                  <span className="group-data-[collapsible=icon]:hidden font-medium">
                    New Chat
                  </span>
                  <PencilIcon className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-sidebar-accent group-data-[collapsible=icon]:text-sidebar-accent-foreground" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              hidden={state !== "collapsed" || isMobile}
            >
              New Chat
            </TooltipContent>
          </Tooltip>
        </div>
        <ThreadList
          threads={threadData?.data}
          activeThreadId={activeThreadId}
        />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
