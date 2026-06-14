"use client";

import React, { FC, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Ellipsis } from "lucide-react";

import { cn } from "@/lib/utils";
import { MessageResponse } from "@/types/thread.types";

import "highlight.js/styles/github-dark.css";

const MarkdownContent: FC<{ content: string; isStreaming: boolean }> =
  React.memo(({ content, isStreaming }) => {
    const rehypePlugins = useMemo(
      () => (isStreaming ? [] : [rehypeHighlight]),
      [isStreaming],
    );

    return (
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_table]:w-full",
        )}
      >
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
          {content}
        </Markdown>
      </div>
    );
  });

MarkdownContent.displayName = "MarkdownContent";

const MessageBox: FC<MessageResponse> = ({ content, role, status }) => {
  const isUser = role === "user";
  const isStreaming = status === "streaming";

  return (
    <div
      className={cn(
        "flex w-full my-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-accent rounded-bl-md",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : content.length === 0 ? (
          <Ellipsis className="h-5 w-5 animate-pulse" />
        ) : (
          <MarkdownContent content={content} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
};

export default MessageBox;
