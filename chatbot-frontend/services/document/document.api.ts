import axios from "axios";
import { appApi } from "../axios";
export const deleteFileFromImageKit = async (fileId: string) => {
  const { data } = await axios.delete(`/api/delete-file/${fileId}`);

  return data;
};

export const fetchUserDocuments = async () => {
  const { data } = await appApi.get("/docs/fetch-documents");
  return data;
};

export const fetchDocumentStatus = async (documentId: string) => {
  const { data } = await appApi.get(`/docs/${documentId}/status`);
  return data;
};
