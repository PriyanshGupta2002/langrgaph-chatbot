"use client";
import React, { useState, FC } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export const ChatInput: FC<{
  onSend: (text: string) => void;
  isSending?: boolean;
}> = ({ onSend, isSending }) => {
  const [text, setText] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="relative p-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={3}
        className="flex-1 min-h-20 pr-16 resize-none"
      />
      <Button
        type="submit"
        variant="secondary"
        size="icon"
        disabled={isSending}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12"
      >
        {isSending ? (
          <Send className="animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};

export default ChatInput;
