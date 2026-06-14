"use client";

import { Edit, Trash } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateThread,
  useDeleteThread,
} from "@/services/threads/thread.query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteDialog from "../shared/delete-dialog";

interface ChatHeaderProps {
  title?: string;
  threadId?: string;
}

const ChatHeader = ({ title, threadId }: ChatHeaderProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title ?? "");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateMutation = useUpdateThread();
  const deleteMutation = useDeleteThread();

  const handleSaveTitle = async () => {
    if (!threadId || !editTitle.trim()) return;
    try {
      await updateMutation.mutateAsync({ threadId, title: editTitle });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update thread:", error);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(threadId || "");
      setShowDeleteDialog(false);
      router.push("/chat");
    } catch (error) {
      console.error("Failed to delete thread:", error);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DeleteDialog
          onConfirm={confirmDelete}
          onOpenChange={setShowDeleteDialog}
          open={showDeleteDialog}
          threadTitle={title || ""}
          isDeleting={deleteMutation.isPending}
        />
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Conversation
          </p>
          {isEditing ? (
            <div className="flex gap-2 mt-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter thread title"
                className="text-2xl font-semibold"
              />
              <Button
                size="sm"
                onClick={handleSaveTitle}
                disabled={updateMutation.isPending}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(title ?? "");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <h1 className="text-2xl font-semibold">{title ?? "New Chat"}</h1>
          )}
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <button
            onClick={() => setIsEditing(true)}
            disabled={updateMutation.isPending}
            className="hover:text-foreground transition-colors cursor-pointer"
            title="Edit title"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="hover:text-red-500 transition-colors cursor-pointer"
            title="Delete thread"
          >
            <Trash size={20} />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Start a conversation and the assistant will reply in the current thread.
      </p>
    </div>
  );
};

export default ChatHeader;
