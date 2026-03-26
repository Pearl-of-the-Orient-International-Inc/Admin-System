import { api } from "@/lib/http-client";
import type {
  BackupDownloadPayload,
  BackupOverviewResponse,
  BackupRestoreResponse,
  BackupSettings,
  BackupSettingsResponse,
  BackupSnapshotEnvelopeResponse,
} from "./backup-database.types";

export async function getBackupOverview() {
  const { data } = await api.get<BackupOverviewResponse>("/backups");
  return data.data;
}

export async function createBackup() {
  const { data } = await api.post<BackupSnapshotEnvelopeResponse>("/backups/create");
  return data.data;
}

export async function updateBackupSettings(payload: BackupSettings) {
  const { data } = await api.patch<BackupSettingsResponse>("/backups/settings", payload);
  return data.data;
}

export async function restoreBackupById(id: string) {
  const { data } = await api.post<BackupRestoreResponse>(
    `/backups/${encodeURIComponent(id)}/restore`,
  );
  return data.data;
}

export async function getBackupDownloadById(id: string) {
  const response = await api.get<Blob>(
    `/backups/${encodeURIComponent(id)}/download`,
    {
      responseType: "blob",
    },
  );
  const contentDisposition = response.headers["content-disposition"];
  const fileNameMatch = contentDisposition?.match(/filename="([^"]+)"/i);

  return {
    blob: response.data,
    fileName: fileNameMatch?.[1] ?? `backup-${id}.json`,
  } satisfies BackupDownloadPayload;
}
