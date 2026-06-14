import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  getThreadById,
  getThreadMessages,
  getThreads,
  updateThread,
  deleteThread,
} from "./thread.api";
import { MessageResponse, ThreadResponse } from "@/types/thread.types";

interface ResponseModel<T> {
  success: boolean;
  message: string;
  data: T;
}

export const useThreads = () => {
  return useQuery<ResponseModel<ThreadResponse[]>>({
    queryKey: ["threads"],
    queryFn: getThreads,
  });
};

export const useThread = (threadId: string) => {
  return useQuery<ResponseModel<ThreadResponse>>({
    queryKey: ["thread", threadId],
    queryFn: () => getThreadById(threadId),
    enabled: Boolean(threadId),
  });
};

export const useThreadMessages = (threadId: string) => {
  return useQuery<ResponseModel<MessageResponse[]>>({
    queryKey: ["threadMessages", threadId],
    queryFn: () => getThreadMessages(threadId),
    enabled: Boolean(threadId),
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseModel<ThreadResponse>,
    unknown,
    string | undefined
  >({
    mutationFn: (title) => createThread(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseModel<ThreadResponse>,
    unknown,
    { threadId: string; title: string }
  >({
    mutationFn: ({ threadId, title }) => updateThread(threadId, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (data.data) {
        queryClient.setQueryData(["thread", data.data.thread_id], {
          data: data.data,
        });
      }
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseModel<null>, unknown, string>({
    mutationFn: (threadId) => deleteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
};
