"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { PageLoadingState } from "@/components/PageLoadingState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SystemLogRecord } from "@/features/system-logs/system-log.types";
import {
  useDeleteSystemLogMutation,
  useSystemLogsQuery,
} from "@/features/system-logs/system-log.hooks";
import { useToast } from "@/hooks/use-toast";
import { ActivityLogPage } from "./activity-log-page";

export function SystemLogsPageContent() {
  const { toast } = useToast();
  const [deleteTargetLog, setDeleteTargetLog] = useState<SystemLogRecord | null>(
    null,
  );
  const logsQuery = useSystemLogsQuery();
  const deleteLogMutation = useDeleteSystemLogMutation();

  const requestDeleteLog = (log: SystemLogRecord) => {
    setDeleteTargetLog(log);
  };

  const handleDeleteLog = async () => {
    if (!deleteTargetLog) return;

    try {
      await deleteLogMutation.mutateAsync(deleteTargetLog.id);
      toast({
        title: "Log deleted",
        description: "The activity log has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to delete this activity log.",
        variant: "error",
      });
    } finally {
      setDeleteTargetLog(null);
    }
  };

  if (logsQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <PageLoadingState mode="table" />
      </section>
    );
  }

  return (
    <>
      <ActivityLogPage
        title="System Logs"
        description="Track administrator actions across the application, including what they changed and when it happened."
        logs={logsQuery.data ?? []}
        emptyTitle="No system logs found"
        emptyDescription="Activity records will appear here once actions are captured across the admin workspace."
        onDeleteLog={requestDeleteLog}
        isDeletingLog={deleteLogMutation.isPending}
        errorTitle={logsQuery.isError ? "Unable to load system logs" : undefined}
        errorDescription={
          logsQuery.isError
            ? logsQuery.error instanceof Error
              ? logsQuery.error.message
              : "System logs could not be loaded right now."
            : undefined
        }
      />

      <AlertDialog
        open={Boolean(deleteTargetLog)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetLog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this activity log?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected activity record for{" "}
              {deleteTargetLog?.actorName ?? "this user"}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTargetLog(null)}
              disabled={deleteLogMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleDeleteLog()}
              disabled={deleteLogMutation.isPending}
            >
              Delete log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
