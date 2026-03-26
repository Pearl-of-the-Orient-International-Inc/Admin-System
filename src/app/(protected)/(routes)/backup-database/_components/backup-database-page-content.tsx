"use client";

import {
  ArchiveRestore,
  Clock3,
  DatabaseBackup,
  Download,
  HardDriveDownload,
  History,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toApiError } from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";
import {
  useBackupOverviewQuery,
  useCreateBackupMutation,
  useDownloadBackupMutation,
  useRestoreBackupMutation,
  useUpdateBackupSettingsMutation,
} from "@/features/backup-database/backup-database.hooks";
import type {
  BackupFrequency,
  BackupSnapshotRecord,
} from "@/features/backup-database/backup-database.types";

const formatBackupDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function BackupDatabasePageContent() {
  const { toast } = useToast();
  const backupOverviewQuery = useBackupOverviewQuery();
  const createBackupMutation = useCreateBackupMutation();
  const updateSettingsMutation = useUpdateBackupSettingsMutation();
  const restoreBackupMutation = useRestoreBackupMutation();
  const downloadBackupMutation = useDownloadBackupMutation();

  const snapshots = backupOverviewQuery.data?.snapshots ?? [];
  const latestSnapshot = backupOverviewQuery.data?.latestSnapshot ?? null;
  const isAutomaticBackupEnabled =
    backupOverviewQuery.data?.settings.automaticBackupEnabled ?? true;
  const backupFrequency =
    backupOverviewQuery.data?.settings.frequency ?? ("DAILY" as BackupFrequency);
  const retentionWindow = String(
    backupOverviewQuery.data?.settings.retentionDays ?? 30,
  );
  const readySnapshots = backupOverviewQuery.data?.stats.readySnapshots ?? 0;
  const failedSnapshots = backupOverviewQuery.data?.stats.failedSnapshots ?? 0;
  const storageCoverage = backupOverviewQuery.data?.stats.storageCoverage ?? 0;

  const handleCreateBackup = async () => {
    try {
      await createBackupMutation.mutateAsync();
      toast({
        variant: "success",
        title: "Backup created",
        description: "A new PostgreSQL JSON backup snapshot is ready.",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Backup failed",
        description: apiError.message ?? "Unable to create backup.",
        variant: "error",
      });
    }
  };

  const handleRestore = async (snapshot: BackupSnapshotRecord) => {
    try {
      await restoreBackupMutation.mutateAsync(snapshot.id);
      toast({
        variant: "success",
        title: "Restore completed",
        description: `${snapshot.fileName} has been restored successfully.`,
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Restore failed",
        description: apiError.message ?? "Unable to restore backup.",
        variant: "error",
      });
    }
  };

  const handleDownload = async (snapshot: BackupSnapshotRecord) => {
    try {
      const download = await downloadBackupMutation.mutateAsync(snapshot.id);
      const objectUrl = window.URL.createObjectURL(download.blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = download.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
      toast({
        variant: "success",
        title: "Download ready",
        description: `${download.fileName} has been downloaded.`,
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Download failed",
        description: apiError.message ?? "Unable to prepare backup download.",
        variant: "error",
      });
    }
  };

  const saveSettings = async (nextSettings: {
    automaticBackupEnabled: boolean;
    frequency: BackupFrequency;
    retentionDays: number;
  }) => {
    try {
      await updateSettingsMutation.mutateAsync({
        automaticBackupEnabled: nextSettings.automaticBackupEnabled,
        frequency: nextSettings.frequency,
        retentionDays: nextSettings.retentionDays,
        nextRunAt: null,
      });
      toast({
        title: "Backup settings updated",
        description: "Automatic backup settings have been saved.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Update failed",
        description: apiError.message ?? "Unable to update backup settings.",
        variant: "error",
      });
    }
  };

  if (backupOverviewQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <PageLoadingState mode="table" />
      </section>
    );
  }

  if (backupOverviewQuery.isError) {
    return (
      <section className="space-y-6 p-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Backup Database
          </h1>
          <p className="text-muted-foreground text-sm">
            Prepare PostgreSQL backups as JSON snapshots, manage retention, and
            review restore readiness.
          </p>
        </div>
        <PageErrorState
          title="Unable to load backup dashboard"
          description={
            backupOverviewQuery.error instanceof Error
              ? backupOverviewQuery.error.message
              : "Backup database data could not be loaded right now."
          }
          backUrl="/dashboard"
          backLabel="Back to dashboard"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Backup Database
          </h1>
          <p className="text-muted-foreground text-sm">
            Prepare PostgreSQL backups as JSON snapshots, manage retention, and
            review restore readiness.
          </p>
        </div>

        <Button
          onClick={() => void handleCreateBackup()}
          disabled={createBackupMutation.isPending}
        >
          <DatabaseBackup className="size-4" />
          {createBackupMutation.isPending
            ? "Preparing backup..."
            : "Create JSON backup"}
        </Button>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Backup Summary</CardTitle>
          <CardDescription>
            Quick overview of retention, automatic schedules, and restore-ready
            snapshots.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Retention"
            value={`${retentionWindow} days`}
            subtitle="Automatic cleanup window for stored JSON files"
            icon={<History className="size-4" />}
            tone="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryCard
            title="Auto Backup"
            value={isAutomaticBackupEnabled ? "Enabled" : "Disabled"}
            subtitle={`Current schedule: ${backupFrequency.toLowerCase()}`}
            icon={<RefreshCcw className="size-4" />}
            tone="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryCard
            title="Restore Ready"
            value={`${readySnapshots}/${snapshots.length}`}
            subtitle={`${failedSnapshots} failed snapshot(s) need attention`}
            icon={<ShieldCheck className="size-4" />}
            tone="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="bg-transparent">
          <CardHeader className="border-b">
            <CardTitle>Manual Backup</CardTitle>
            <CardDescription>
              Trigger an on-demand PostgreSQL export that will later generate a
              downloadable snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoTile
                label="Export format"
                value="JSON"
                helper="Structured backup file"
              />
              <InfoTile
                label="Included tables"
                value="17"
                helper="Core application tables included in JSON export"
              />
              <InfoTile
                label="Estimated size"
                value={latestSnapshot?.sizeLabel ?? "Unknown"}
                helper="Based on the latest successful snapshot"
              />
            </div>

            <SummaryCard
              title="Latest Backup"
              value={
                latestSnapshot
                  ? formatBackupDate(latestSnapshot.createdAt)
                  : "None"
              }
              subtitle={latestSnapshot?.fileName ?? "No backup created yet"}
              icon={<Clock3 className="size-4" />}
              tone="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
            />

            <div className="rounded-xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Snapshot health</p>
                <span className="text-muted-foreground text-xs">
                  {storageCoverage}% ready
                </span>
              </div>
              <Progress value={storageCoverage} />
              <p className="text-muted-foreground mt-2 text-xs">
                Tracks how many recent restore points are currently marked
                ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() => void handleCreateBackup()}
                disabled={createBackupMutation.isPending}
              >
                <DatabaseBackup className="size-4" />
                {createBackupMutation.isPending
                  ? "Preparing..."
                  : "Create backup now"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!latestSnapshot}
                onClick={() => void (async () => {
                  if (latestSnapshot) {
                    await handleDownload(latestSnapshot);
                  }
                })()}
              >
                <HardDriveDownload className="size-4" />
                Download latest JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-transparent">
          <CardHeader className="border-b pb-4">
            <CardTitle>Automatic Backup & Restore</CardTitle>
            <CardDescription>
              Frontend configuration preview for scheduled JSON snapshots and
              restore controls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Enable automatic backup</p>
                <p className="text-muted-foreground text-xs">
                  Run recurring PostgreSQL-to-JSON snapshots without manual
                  action.
                </p>
              </div>
              <Switch
                checked={isAutomaticBackupEnabled}
                disabled={updateSettingsMutation.isPending}
                onCheckedChange={(checked) =>
                  void saveSettings({
                    automaticBackupEnabled: checked,
                    frequency: backupFrequency,
                    retentionDays: Number(retentionWindow),
                  })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Frequency</p>
                <Select
                  value={backupFrequency}
                  onValueChange={(value) =>
                    void saveSettings({
                      automaticBackupEnabled: isAutomaticBackupEnabled,
                      frequency: value as BackupFrequency,
                      retentionDays: Number(retentionWindow),
                    })
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">Hourly</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Retention window</p>
                <Select
                  value={retentionWindow}
                  onValueChange={(value) =>
                    void saveSettings({
                      automaticBackupEnabled: isAutomaticBackupEnabled,
                      frequency: backupFrequency,
                      retentionDays: Number(value),
                    })
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <SelectValue placeholder="Select retention" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoTile
                label="Next scheduled run"
                value={
                  backupOverviewQuery.data?.settings.nextRunAt
                    ? formatBackupDate(backupOverviewQuery.data.settings.nextRunAt)
                    : "Not scheduled"
                }
                helper="Calculated from the saved automatic backup settings"
              />
              <InfoTile
                label="Restore target"
                value="PostgreSQL JSON import"
                helper="Will later validate snapshot structure before restore"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={restoreBackupMutation.isPending || !latestSnapshot}
              onClick={() => {
                if (latestSnapshot) {
                  void handleRestore(latestSnapshot);
                }
              }}
            >
              <ArchiveRestore className="size-4" />
              {restoreBackupMutation.isPending
                ? "Queuing restore..."
                : "Restore latest backup"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            Review the recent JSON snapshots that will later be backed by real
            backend jobs and restore actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshots.length === 0 ? (
            <PageEmptyState
              title="No backup snapshots found"
              description="Create the first PostgreSQL JSON backup to start building restore history."
              className="min-h-80 border-0 bg-transparent p-0"
            />
          ) : (
            snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{snapshot.fileName}</p>
                    <Badge variant={getStatusVariant(snapshot.status)}>
                      {formatStatus(snapshot.status)}
                    </Badge>
                    <Badge variant="secondary">{snapshot.source}</Badge>
                  </div>

                  <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                    <span>{formatBackupDate(snapshot.createdAt)}</span>
                    <span>{snapshot.sizeLabel}</span>
                    <span>{snapshot.tableCount} tables</span>
                    <span>{snapshot.retentionLabel}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={downloadBackupMutation.isPending}
                    onClick={() => void handleDownload(snapshot)}
                  >
                    <Download className="size-4" />
                    Download JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={
                      snapshot.status !== "READY" || restoreBackupMutation.isPending
                    }
                    onClick={() => void handleRestore(snapshot)}
                  >
                    <ArchiveRestore className="size-4" />
                    {restoreBackupMutation.isPending ? "Restoring..." : "Restore"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          {title}
        </p>
        <span className={`rounded-md p-1.5 ${tone}`}>{icon}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </div>
  );
}

function InfoTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
        {helper}
      </p>
    </div>
  );
}

function formatStatus(status: BackupSnapshotRecord["status"]) {
  if (status === "READY") return "Ready";
  if (status === "IN_PROGRESS") return "In progress";
  return "Failed";
}

function getStatusVariant(status: BackupSnapshotRecord["status"]) {
  if (status === "READY") return "success";
  if (status === "IN_PROGRESS") return "warning";
  return "error";
}
