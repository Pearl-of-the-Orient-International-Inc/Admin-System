export type BackupFrequency = "HOURLY" | "DAILY" | "WEEKLY";
export type BackupSnapshotStatus = "READY" | "IN_PROGRESS" | "FAILED";
export type BackupSnapshotSource = "MANUAL" | "AUTOMATIC";

export type BackupSnapshotRecord = {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  source: BackupSnapshotSource;
  status: BackupSnapshotStatus;
  sizeBytes: number;
  sizeLabel: string;
  tableCount: number;
  retentionDays: number;
  retentionLabel: string;
  restoredAt: string | null;
};

export type BackupSettings = {
  automaticBackupEnabled: boolean;
  frequency: BackupFrequency;
  retentionDays: number;
  nextRunAt: string | null;
};

export type BackupOverview = {
  settings: BackupSettings;
  stats: {
    totalSnapshots: number;
    readySnapshots: number;
    failedSnapshots: number;
    latestBackupAt: string | null;
    storageCoverage: number;
    totalTables: number;
  };
  latestSnapshot: BackupSnapshotRecord | null;
  snapshots: BackupSnapshotRecord[];
};

export type BackupOverviewResponse = {
  code: string;
  message: string;
  data: BackupOverview;
};

export type BackupSnapshotEnvelopeResponse = {
  code: string;
  message: string;
  data: BackupSnapshotRecord;
};

export type BackupSettingsResponse = {
  code: string;
  message: string;
  data: BackupSettings;
};

export type BackupRestoreResponse = {
  code: string;
  message: string;
  data: {
    id: string;
    fileName: string;
  };
};

export type BackupDownloadPayload = {
  blob: Blob;
  fileName: string;
};
