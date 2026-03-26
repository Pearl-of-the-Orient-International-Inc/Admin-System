import { api } from "@/lib/http-client";
import type { SystemLogListResponse } from "./system-log.types";

export async function getSystemLogs(limit = 200) {
  const { data } = await api.get<SystemLogListResponse>("/activity-logs", {
    params: { limit },
  });

  return data.data;
}

export async function getUserActivityLogs(userId: string, limit = 200) {
  const { data } = await api.get<SystemLogListResponse>(
    `/activity-logs/users/${encodeURIComponent(userId)}`,
    {
      params: { limit },
    },
  );

  return data.data;
}

export async function deleteSystemLogById(id: string) {
  await api.delete(`/activity-logs/${encodeURIComponent(id)}`);
}
