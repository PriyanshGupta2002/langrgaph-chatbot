export interface ThreadResponse {
  thread_id: string;
  title: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";

export type MessageStatus = "streaming" | "completed" | "failed";

export interface MessageResponse {
  message_id: string;
  content: string;
  role: MessageRole;
  thread_id: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

export interface ToolEvent {
  id: string;
  tool: string;
  status: "running" | "completed";
}
