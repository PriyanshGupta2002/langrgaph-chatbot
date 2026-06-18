import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadPdf } from "./upload.api";

export const useUploadPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPdf,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
};
