import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as backupApi from "./backup-database.api";

export const useBackupOverviewQuery = () =>
  useQuery({
    queryKey: ["backup-database", "overview"],
    queryFn: backupApi.getBackupOverview,
    staleTime: 30_000,
  });

export const useCreateBackupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backupApi.createBackup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backup-database"] });
    },
    meta: { feature: "backupDatabase.create" },
  });
};

export const useUpdateBackupSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backupApi.updateBackupSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backup-database"] });
    },
    meta: { feature: "backupDatabase.updateSettings" },
  });
};

export const useRestoreBackupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backupApi.restoreBackupById,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backup-database"] });
    },
    meta: { feature: "backupDatabase.restore" },
  });
};

export const useDownloadBackupMutation = () =>
  useMutation({
    mutationFn: backupApi.getBackupDownloadById,
    meta: { feature: "backupDatabase.download" },
  });
