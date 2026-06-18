import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteFileFromImageKit,
  fetchDocumentStatus,
  fetchUserDocuments,
} from "./document.api";
import { DocumentResponse, DocumentStatus } from "@/types/document.types";

interface ResponseModel<T> {
  success: boolean;
  message: string;
  data: T;
}

export const useDeleteImageFromImageKit = () => {
  return useMutation({
    mutationFn: deleteFileFromImageKit,
  });
};

export const useDocuments = () => {
  return useQuery<ResponseModel<DocumentResponse[]>>({
    queryKey: ["documents"],
    queryFn: fetchUserDocuments,
  });
};

export const useDocumentStatus = (
  documentId: string,
  initialStage: DocumentStatus,
) => {
  return useQuery({
    queryKey: ["document-status", documentId],
    queryFn: () => fetchDocumentStatus(documentId),

    enabled:
      initialStage !== DocumentStatus.COMPLETED &&
      initialStage !== DocumentStatus.FAILED,

    refetchInterval: (query) => {
      const stage = query.state.data?.data?.document_stage;

      if (
        stage === DocumentStatus.COMPLETED ||
        stage === DocumentStatus.FAILED
      ) {
        return false;
      }

      return 2000;
    },
  });
};
