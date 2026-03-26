"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  History,
} from "lucide-react";

import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemLogRecord } from "@/features/system-logs/system-log.types";
import { getSystemLogSummary } from "@/features/system-logs/system-log.utils";
import { SystemLogDetailsSheet } from "./system-log-details-sheet";
import { SystemLogsDataTable } from "./system-logs-data-table";

type ActivityLogPageProps = {
  title: string;
  description: string;
  logs: SystemLogRecord[];
  emptyTitle: string;
  emptyDescription: string;
  onDeleteLog?: (log: SystemLogRecord) => void;
  isDeletingLog?: boolean;
  backUrl?: string;
  backLabel?: string;
  errorTitle?: string;
  errorDescription?: string;
};

export function ActivityLogPage({
  title,
  description,
  logs,
  emptyTitle,
  emptyDescription,
  onDeleteLog,
  isDeletingLog = false,
  backUrl,
  backLabel = "Back",
  errorTitle,
  errorDescription,
}: ActivityLogPageProps) {
  const [selectedLog, setSelectedLog] = useState<SystemLogRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const summary = useMemo(() => getSystemLogSummary(logs), [logs]);

  const handleViewLog = (log: SystemLogRecord) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const showErrorState = Boolean(errorTitle && errorDescription);
  const hasNoLogs = !showErrorState && logs.length === 0;

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          {backUrl ? (
            <Button asChild variant="outline" size="icon">
              <Link href={backUrl}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          ) : null}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </div>

      {showErrorState ? (
        <PageErrorState
          title={errorTitle!}
          description={errorDescription!}
          backUrl={backUrl ?? "/dashboard"}
          backLabel={backLabel}
        />
      ) : hasNoLogs ? (
        <PageEmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>
                Snapshot of recent user actions captured across the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Actions"
                value={summary.total}
                subtitle="All recorded activity items"
                icon={<History className="size-4" />}
                tone="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
              />
              <SummaryCard
                title="Successful"
                value={summary.successful}
                subtitle="Completed without issues"
                icon={<CheckCircle2 className="size-4" />}
                tone="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
              />
              <SummaryCard
                title="Warnings / Failed"
                value={`${summary.warnings} / ${summary.failed}`}
                subtitle="Needs review or follow-up"
                icon={<AlertTriangle className="size-4" />}
                tone="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
              />
              <SummaryCard
                title="Last 24 Hours"
                value={summary.recent}
                subtitle={`${summary.uniqueUsers} active user(s)`}
                icon={<Clock3 className="size-4" />}
                tone="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
              />
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Review who performed each action, when it happened, and what area
                of the application it affected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsDataTable
                data={logs}
                onViewLog={handleViewLog}
                onDeleteLog={onDeleteLog}
                isDeleting={isDeletingLog}
              />
            </CardContent>
          </Card>
        </>
      )}

      <SystemLogDetailsSheet
        log={selectedLog}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
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
  value: number | string;
  subtitle: string;
  icon: ReactNode;
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
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </div>
  );
}
