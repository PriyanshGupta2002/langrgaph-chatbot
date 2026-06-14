"use client";

import React, { useState } from "react";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import {
  useUpdateThread,
  useDeleteThread,
} from "@/services/threads/thread.query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import DeleteDialog from "../shared/delete-dialog";

interface ThreadMenuProps {
  threadId: string;
  threadTitle: string;
}

export const ThreadMenu = ({ threadId, threadTitle }: ThreadMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(threadTitle);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const updateMutation = useUpdateThread();
  const deleteMutation = useDeleteThread();
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditSave = async () => {
    if (!editTitle.trim()) return;
    try {
      await updateMutation.mutateAsync({
        threadId,
        title: editTitle,
      });
      setIsEditing(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update thread:", error);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    setIsOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(threadId);
      setShowDeleteDialog(false);
      router.push("/chat");
    } catch (error) {
      console.error("Failed to delete thread:", error);
      setShowDeleteDialog(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full" ref={menuRef}>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="h-7 text-sm"
          placeholder="Thread title"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={handleEditSave}
          disabled={updateMutation.isPending}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => {
            setIsEditing(false);
            setEditTitle(threadTitle);
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-sidebar-accent rounded transition-colors"
        title="Thread options"
      >
        <MoreHorizontal size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50 w-44">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
            disabled={updateMutation.isPending}
          >
            <Edit2 size={14} />
            Edit
          </button>
          <div className="border-t border-border" />
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 text-red-600 flex items-center gap-2 transition-colors"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
      <DeleteDialog
        onConfirm={confirmDelete}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
        threadTitle={threadTitle}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ThreadMenu;
