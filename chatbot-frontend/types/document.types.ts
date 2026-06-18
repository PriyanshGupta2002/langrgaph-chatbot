export enum DocumentStatus {
  "PROCESSING" = "processing",
  "COMPLETED" = "completed",
  "FAILED" = "failed",
}
export interface DocumentResponse {
  document_id: string;
  user_id: number;
  document_url: string;
  document_name: string;
  document_completion_rate: number;
  created_at: string;
  updated_at: string;
  document_stage: DocumentStatus;
}
