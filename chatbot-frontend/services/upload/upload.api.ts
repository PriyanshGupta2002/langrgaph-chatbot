import { appApi } from "../axios";

interface UploadPdfPayload {
  document_url: string;
  document_name: string;
}

export const uploadPdf = async ({
  document_name,
  document_url,
}: UploadPdfPayload) => {
  const { data } = await appApi.post("/docs/upload", {
    document_name,
    document_url,
  });

  return data;
};
