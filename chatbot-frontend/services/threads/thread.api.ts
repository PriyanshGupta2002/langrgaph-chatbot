import { appApi } from "../axios";
import { MessageResponse, ThreadResponse } from "@/types/thread.types";

interface ResponseModel<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getThreads = async () => {
  const { data } =
    await appApi.get<ResponseModel<ThreadResponse[]>>("/threads");
  return data;
};

export const createThread = async (title?: string | null) => {
  const payload = title ? { title } : {};
  const { data } = await appApi.post<ResponseModel<ThreadResponse>>(
    "/threads",
    payload,
  );
  return data;
};

export const getThreadById = async (threadId: string) => {
  const { data } = await appApi.get<ResponseModel<ThreadResponse>>(
    `/threads/${threadId}`,
  );
  return data;
};

export const getThreadMessages = async (threadId: string) => {
  const { data } = await appApi.get<ResponseModel<MessageResponse[]>>(
    `/threads/${threadId}/messages`,
  );
  return data;
};

export const updateThread = async (threadId: string, title: string) => {
  const { data } = await appApi.put<ResponseModel<ThreadResponse>>(
    `/threads/${threadId}`,
    { title },
  );
  return data;
};

export const deleteThread = async (threadId: string) => {
  const { data } = await appApi.delete<ResponseModel<null>>(
    `/threads/${threadId}`,
  );
  return data;
};
