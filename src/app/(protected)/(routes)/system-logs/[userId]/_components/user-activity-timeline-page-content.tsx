"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Filter,
  History,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useAccountByIdQuery } from "@/features/accounts/account.hooks";
import { useUserActivityLogsQuery } from "@/features/system-logs/system-log.hooks";
import type { SystemLogRecord } from "@/features/system-logs/system-log.types";
import {
  formatSystemLogActionType,
  formatSystemLogDate,
  formatSystemLogResult,
  getSystemLogSummary,
} from "@/features/system-logs/system-log.utils";
import { PageLoadingState } from "@/components/PageLoadingState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageEmptyState } from "@/components/PageEmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SystemLogDetailsSheet } from "../../_components/system-log-details-sheet";
import { useRouter } from "next/navigation";

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimelineGroupDate = (dateValue: string) =>
  new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTimelineTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const getLogSearchValue = (log: SystemLogRecord) =>
  [
    log.actorName,
    log.actorEmail,
    log.actionLabel,
    log.moduleLabel,
    log.targetLabel,
    log.description,
    log.result,
    log.ipAddress,
    log.deviceLabel,
    ...(log.metadata ?? []),
  ]
    .join(" ")
    .toLowerCase();

export function UserActivityTimelinePageContent({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [selectedLog, setSelectedLog] = useState<SystemLogRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const accountQuery = useAccountByIdQuery(userId);
  const activityLogsQuery = useUserActivityLogsQuery(
    userId,
    Boolean(accountQuery.data),
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const logs = activityLogsQuery.data ?? [];

    return logs.filter((log) => {
      const matchesSearch = normalizedSearch
        ? getLogSearchValue(log).includes(normalizedSearch)
        : true;
      const matchesDate = selectedDate
        ? log.timestamp.slice(0, 10) === selectedDate
        : true;

      return matchesSearch && matchesDate;
    });
  }, [activityLogsQuery.data, searchQuery, selectedDate]);

  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce<Record<string, SystemLogRecord[]>>((groups, log) => {
      const dateKey = log.timestamp.slice(0, 10);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
      return groups;
    }, {});
  }, [filteredLogs]);

  const groupedEntries = useMemo(
    () =>
      Object.entries(groupedLogs).sort(([dateA], [dateB]) =>
        dateA < dateB ? 1 : -1,
      ),
    [groupedLogs],
  );

  const summary = useMemo(() => getSystemLogSummary(filteredLogs), [filteredLogs]);

  const handleViewLog = (log: SystemLogRecord) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const resetDateFilter = () => {
    setSelectedDate("");
  };

  if (accountQuery.isLoading || activityLogsQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <PageLoadingState mode="table" />
      </section>
    );
  }

  if (accountQuery.isError) {
    return (
      <section className="space-y-6 p-10">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/system-logs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              User Activity
            </h1>
            <p className="text-muted-foreground text-sm">
              Review an individual administrator&apos;s activity timeline.
            </p>
          </div>
        </div>

        <PageErrorState
          title="Unable to load user activity"
          description={
            accountQuery.error instanceof Error
              ? accountQuery.error.message
              : "This user activity page could not be loaded right now."
          }
          backUrl="/system-logs"
          backLabel="Back to system logs"
        />
      </section>
    );
  }

  if (!accountQuery.data) {
    return (
      <section className="space-y-6 p-10">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/system-logs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              User Activity
            </h1>
            <p className="text-muted-foreground text-sm">
              Review an individual administrator&apos;s activity timeline.
            </p>
          </div>
        </div>

        <PageErrorState
          title="Account not found"
          description="The requested administrator could not be found."
          backUrl="/system-logs"
          backLabel="Back to system logs"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Button onClick={() => router.back()} variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>

          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {accountQuery.data.name}&apos;s Activity
              </h1>
              <p className="text-muted-foreground text-sm">
                Search and review the recorded actions performed by{" "}
                {accountQuery.data.email}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search the user&apos;s activity and narrow the timeline by date. The
            date filter defaults to today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search action, module, target, description, device, or result..."
              className="pl-9"
            />
          </div>

          <div className="relative">
            <CalendarDays className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" onClick={resetDateFilter}>
            <Filter className="size-4" />
            All dates
          </Button>
        </CardContent>
      </Card>

      {activityLogsQuery.isError ? (
        <PageErrorState
          title="Unable to load activity timeline"
          description={
            activityLogsQuery.error instanceof Error
              ? activityLogsQuery.error.message
              : "This activity timeline could not be loaded right now."
          }
          backUrl="/system-logs"
          backLabel="Back to system logs"
        />
      ) : filteredLogs.length === 0 ? (
        <PageEmptyState
          title="No activity found"
          description={
            selectedDate
              ? "No activity records match the current search and date filter."
              : "No activity records match the current search filter."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Filtered Actions"
              value={summary.total}
              subtitle="Matching current search and date filters"
              icon={<History className="size-4" />}
              tone="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
            />
            <SummaryCard
              title="Successful"
              value={summary.successful}
              subtitle="Completed without issues"
              icon={<ShieldCheck className="size-4" />}
              tone="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
            />
            <SummaryCard
              title="Last 24 Hours"
              value={summary.recent}
              subtitle="Recent activity in the selected set"
              icon={<Clock3 className="size-4" />}
              tone="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
            />
            <SummaryCard
              title="Warnings / Failed"
              value={`${summary.warnings} / ${summary.failed}`}
              subtitle="Records that may need review"
              icon={<Filter className="size-4" />}
              tone="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
            />
          </div>

          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Chronological view of this administrator&apos;s actions for the
                selected filter set.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {groupedEntries.map(([dateKey, logs]) => (
                <div key={dateKey} className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="text-muted-foreground pt-1 text-sm font-medium">
                    {formatTimelineGroupDate(dateKey)}
                  </div>

                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <div
                        key={log.id}
                        className="grid grid-cols-[32px_minmax(0,1fr)] gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full border">
                            <History className="size-4" />
                          </div>
                          {index < logs.length - 1 ? (
                            <div className="bg-border mt-2 h-full w-px min-h-12" />
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleViewLog(log)}
                          className="hover:border-primary/40 hover:bg-accent/40 flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">
                                {log.actionLabel}
                              </p>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {log.description}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <Badge variant={getResultVariant(log.result)}>
                                {formatSystemLogResult(log.result)}
                              </Badge>
                              <Badge variant="secondary">
                                {formatSystemLogActionType(log.actionType)}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                            <span>{formatSystemLogDate(log.timestamp)}</span>
                            <span>{log.moduleLabel}</span>
                            <span>{log.targetLabel}</span>
                            <span>{log.deviceLabel}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{formatTimelineTime(log.timestamp)}</Badge>
                            {log.metadata?.map((item) => (
                              <Badge key={`${log.id}-${item}`} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </div>
  );
}

function getResultVariant(result: SystemLogRecord["result"]) {
  if (result === "SUCCESS") return "success";
  if (result === "WARNING") return "warning";
  return "error";
}
