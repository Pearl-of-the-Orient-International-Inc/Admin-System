import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as systemLogApi from "./system-log.api";

export const useSystemLogsQuery = (limit = 200) =>
  useQuery({
    queryKey: ["system-logs", "list", limit],
    queryFn: () => systemLogApi.getSystemLogs(limit),
    staleTime: 30_000,
  });

export const useUserActivityLogsQuery = (
  userId: string,
  enabled = true,
  limit = 200,
) =>
  useQuery({
    queryKey: ["system-logs", "user", userId, limit],
    queryFn: () => systemLogApi.getUserActivityLogs(userId, limit),
    enabled: Boolean(userId) && enabled,
    staleTime: 30_000,
  });

export const useDeleteSystemLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: systemLogApi.deleteSystemLogById,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["system-logs"] });
    },
    meta: { feature: "systemLogs.delete" },
  });
};
