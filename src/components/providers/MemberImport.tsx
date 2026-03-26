"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FileSpreadsheet,
  LoaderCircle,
  X,
} from "lucide-react";

import { createMember } from "@/features/members/member.api";
import type { CreateMemberByAdminRequest } from "@/features/members/member.types";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/query-client";
import { toApiError } from "@/lib/http-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type MemberImportQueueItem = {
  rowNumber: number;
  fullName: string;
  email: string;
  payload: CreateMemberByAdminRequest;
};

type MemberImportJob = {
  id: string;
  fileName: string;
  total: number;
  processed: number;
  successCount: number;
  failedCount: number;
  status: "running" | "completed";
  currentLabel: string | null;
  recentFailures: Array<{
    rowNumber: number;
    fullName: string;
    message: string;
  }>;
};

type MemberImportContextValue = {
  activeJob: MemberImportJob | null;
  isImportRunning: boolean;
  startImport: (input: {
    fileName: string;
    rows: MemberImportQueueItem[];
  }) => Promise<boolean>;
  dismissJob: () => void;
};

const MemberImportContext = createContext<MemberImportContextValue | null>(null);

export const MemberImportProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [activeJob, setActiveJob] = useState<MemberImportJob | null>(null);
  const activeJobRef = useRef<MemberImportJob | null>(null);

  const syncJob = (
    updater:
      | MemberImportJob
      | null
      | ((current: MemberImportJob | null) => MemberImportJob | null),
  ) => {
    setActiveJob((current) => {
      const next =
        typeof updater === "function"
          ? updater(current)
          : updater;

      activeJobRef.current = next;
      return next;
    });
  };

  const dismissJob = () => {
    if (activeJobRef.current?.status === "running") {
      return;
    }

    syncJob(null);
  };

  const startImport: MemberImportContextValue["startImport"] = async ({
    fileName,
    rows,
  }) => {
    if (rows.length === 0) {
      toast({
        variant: "warning",
        title: "Nothing to import",
        description: "There are no valid member rows ready to import.",
      });
      return false;
    }

    if (activeJobRef.current?.status === "running") {
      toast({
        variant: "warning",
        title: "Import already running",
        description:
          "Please wait for the current background import to finish before starting another one.",
      });
      return false;
    }

    const initialJob: MemberImportJob = {
      id: `${Date.now()}`,
      fileName,
      total: rows.length,
      processed: 0,
      successCount: 0,
      failedCount: 0,
      status: "running",
      currentLabel: null,
      recentFailures: [],
    };

    syncJob(initialJob);

    toast({
      variant: "success",
      title: "Background import started",
      description: `${rows.length} member row(s) are now importing in the background.`,
    });

    void (async () => {
      const updateProgress = (input: {
        success?: boolean;
        failure?: {
          rowNumber: number;
          fullName: string;
          message: string;
        };
        currentLabel?: string | null;
      }) => {
        syncJob((current) => {
          if (!current) return current;

          const recentFailures = input.failure
            ? [input.failure, ...current.recentFailures].slice(0, 5)
            : current.recentFailures;

          return {
            ...current,
            processed: current.processed + (input.success || input.failure ? 1 : 0),
            successCount: current.successCount + (input.success ? 1 : 0),
            failedCount: current.failedCount + (input.failure ? 1 : 0),
            currentLabel:
              input.currentLabel !== undefined
                ? input.currentLabel
                : current.currentLabel,
            recentFailures,
          };
        });
      };

      const runQueue = async () => {
        for (const row of rows) {
          updateProgress({ currentLabel: row.fullName });

          try {
            await createMember(row.payload);
            updateProgress({ success: true });
          } catch (error) {
            const apiError = toApiError(error);
            const message =
              apiError.message ||
              (error instanceof Error
                ? error.message
                : "Unable to import this member row.");

            updateProgress({
              failure: {
                rowNumber: row.rowNumber,
                fullName: row.fullName,
                message,
              },
            });
          }
        }
      };

      try {
        await runQueue();

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["members"] }),
          queryClient.invalidateQueries({ queryKey: ["organizational-structure"] }),
        ]);

        syncJob((current) =>
          current
            ? {
                ...current,
                status: "completed",
                currentLabel: null,
              }
            : current,
        );

        const completedJob = activeJobRef.current;
        if (!completedJob) {
          return;
        }

        toast({
          variant: completedJob.failedCount > 0 ? "warning" : "success",
          title: "Background import finished",
          description: `${completedJob.successCount} succeeded, ${completedJob.failedCount} failed.`,
        });
      } catch (error) {
        syncJob((current) =>
          current
            ? {
                ...current,
                status: "completed",
                currentLabel: null,
                failedCount: current.failedCount + Math.max(0, current.total - current.processed),
                processed: current.total,
              }
            : current,
        );

        toast({
          variant: "error",
          title: "Background import failed",
          description:
            error instanceof Error
              ? error.message
              : "The import job stopped unexpectedly.",
        });
      }
    })();

    return true;
  };

  const progressValue = activeJob
    ? Math.round((activeJob.processed / Math.max(activeJob.total, 1)) * 100)
    : 0;

  return (
    <MemberImportContext.Provider
      value={{
        activeJob,
        isImportRunning: activeJob?.status === "running",
        startImport,
        dismissJob,
      }}
    >
      {children}

      {activeJob ? (
        <div className="pointer-events-none fixed right-4 bottom-4 z-80 w-full max-w-[320px] p-2 sm:right-6 sm:bottom-6">
          <Card className="pointer-events-auto py-0! border shadow-2xl">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    {activeJob.status === "running" ? (
                      <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <FileSpreadsheet className="size-4 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activeJob.status === "running"
                          ? "Importing members..."
                          : "Member import finished"}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {activeJob.status === "running"
                          ? `${activeJob.processed} of ${activeJob.total} processed`
                          : activeJob.failedCount > 0
                            ? `${activeJob.successCount} succeeded, ${activeJob.failedCount} failed`
                            : `${activeJob.total} member records imported`}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={dismissJob}
                    disabled={activeJob.status === "running"}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                {activeJob.status === "running" ? (
                  <Progress value={progressValue} className="h-1.5" />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </MemberImportContext.Provider>
  );
};

export const useMemberImport = () => {
  const context = useContext(MemberImportContext);

  if (!context) {
    throw new Error("useMemberImport must be used within MemberImportProvider.");
  }

  return context;
};
