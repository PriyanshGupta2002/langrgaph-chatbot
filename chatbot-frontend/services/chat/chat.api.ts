import { appApi } from "@/services/axios";

export type ChatRequest = { thread_id?: string | null; message: string };

export async function streamChat(
  payload: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone?: () => void,
  onError?: (err: unknown) => void,
  onToolStart?: (tool: string) => void,
  onToolEnd?: (tool: string) => void,
) {
  let isDone = false;
  const safeDone = () => {
    if (isDone) return;
    isDone = true;
    onDone?.();
  };

  try {
    const base =
      appApi?.defaults?.baseURL || process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = `${String(base).replace(/\/*$/, "")}/chat/stream`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stream request failed: ${res.status} ${text}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No readable stream in response");

    const decoder = new TextDecoder();
    let buf = "";
    let lastEventType = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        safeDone();
        break;
      }

      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() || "";

      for (const part of parts) {
        lastEventType = "";

        for (const line of part.split("\n")) {
          if (line === "") continue;

          // ✅ Handle SSE event type line
          if (line.startsWith("event:")) {
            lastEventType = line.replace(/^event:\s?/, "").trim();

            continue;
          }

          if (line.startsWith("data:")) {
            const data = line.replace(/^data:\s?/, "");

            if (lastEventType === "done" || data === "[DONE]") {
              safeDone();
              continue;
            }

            if (lastEventType === "tool_start") {
              try {
                const parsed = JSON.parse(data);
                onToolStart?.(parsed.tool);
              } catch {}
              continue;
            }

            if (lastEventType === "tool_end") {
              try {
                const parsed = JSON.parse(data);
                onToolEnd?.(parsed.tool);
              } catch {}
              continue;
            }

            if (data === "complete" || data === "") continue;

            try {
              const parsed = JSON.parse(data);

              if (typeof parsed === "string") {
                onChunk(parsed);
                continue;
              }

              if (parsed?.delta) {
                onChunk(String(parsed.delta));
                continue;
              }

              if (parsed?.content) {
                onChunk(String(parsed.content));
                continue;
              }
            } catch {
              onChunk(data);
            }
          }
        }
      }
    }
  } catch (err) {
    onError?.(err);
    throw err;
  }
}
