"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  FileBadge2,
  FileStack,
  Files,
  LayoutGrid,
  MoreVertical,
  Plus,
  Edit,
  Rows3,
  Signature,
  Archive,
  RotateCcw,
  Send,
  ShieldMinus,
  Shapes,
  Trash2,
} from "lucide-react";

import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import {
  formatMemoDate,
  memoTemplateOptions,
  type MemoTemplateType,
} from "./memo-announcements-data";
import type { MemoAnnouncementRecord } from "@/features/memo-announcements/memo-announcement.types";
import {
  useArchiveMemoAnnouncementMutation,
  useDeleteMemoAnnouncementMutation,
  useMemoAnnouncementsQuery,
  usePublishMemoAnnouncementMutation,
  useRejectMemoAnnouncementMutation,
  useRestoreMemoAnnouncementMutation,
} from "@/features/memo-announcements/memo-announcement.hooks";
import { MemoAnnouncementsDataTable } from "./memo-announcements-data-table";
import { MemoTemplateDialog } from "./memo-template-dialog";

type MemoViewMode = "grid" | "table";
type MemoFilter = "ALL" | MemoTemplateType;
type MemoRecordAction = {
  type: "archive" | "restore" | "delete" | "reject" | "approve";
  record: MemoAnnouncementRecord;
};

export function MemoAnnouncementsPageContent() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<MemoViewMode>("grid");
  const [filter, setFilter] = useState<MemoFilter>("ALL");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [pendingRecordAction, setPendingRecordAction] =
    useState<MemoRecordAction | null>(null);
  const archiveMemoMutation = useArchiveMemoAnnouncementMutation();
  const restoreMemoMutation = useRestoreMemoAnnouncementMutation();
  const deleteMemoMutation = useDeleteMemoAnnouncementMutation();
  const rejectMemoMutation = useRejectMemoAnnouncementMutation();
  const publishMemoMutation = usePublishMemoAnnouncementMutation();
  const memosQuery = useMemoAnnouncementsQuery({
    limit: 1000,
    sortBy: "updatedAt",
  });

  const isLoading = memosQuery.isLoading;
  const isError = memosQuery.isError;
  const error = memosQuery.error;
  const records = useMemo(
    () => memosQuery.data?.items ?? [],
    [memosQuery.data?.items],
  );
  const hasNoRecords = !isLoading && !isError && records.length === 0;

  const filteredRecords = useMemo(() => {
    if (filter === "ALL") {
      return records;
    }

    return records.filter((record) => record.category === filter);
  }, [filter, records]);

  const announcementCount = useMemo(
    () => records.filter((record) => record.category === "ANNOUNCEMENT").length,
    [records],
  );
  const customTemplateCount = useMemo(
    () =>
      records.filter(
        (record) => record.category === "BLANK",
      ).length,
    [records],
  );
  const totalSignatories = useMemo(
    () => records.reduce((count, record) => count + record.recipients.length, 0),
    [records],
  );
  const latestIssuedLabel = records[0]
    ? formatMemoDate(records[0].publishedAt ?? records[0].createdAt)
    : "None";

  const handleView = (record: MemoAnnouncementRecord) => {
    toast({
      variant: "info",
      title: "Preview coming next",
      description: `${record.title} is ready for a detail or PDF preview flow later.`,
    });
  };

  const handleEdit = (record: MemoAnnouncementRecord) => {
    window.location.href = `/memo-editor/${record.id}`;
  };

  const handleCopyId = async (record: MemoAnnouncementRecord) => {
    await navigator.clipboard.writeText(record.referenceNumber);
    toast({
      variant: "success",
      title: "Reference number copied",
      description: `${record.referenceNumber} is now in your clipboard.`,
    });
  };

  const handleArchive = async (record: MemoAnnouncementRecord) => {
    try {
      await archiveMemoMutation.mutateAsync(record.id);
      toast({
        variant: "success",
        title: "Memo archived",
        description: `${record.referenceNumber} has been archived.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Archive failed",
        description:
          error instanceof Error
            ? error.message
            : "The memo could not be archived right now.",
      });
    }
  };

  const handleRestore = async (record: MemoAnnouncementRecord) => {
    try {
      await restoreMemoMutation.mutateAsync(record.id);
      toast({
        variant: "success",
        title: "Memo restored",
        description: `${record.referenceNumber} has been restored.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Restore failed",
        description:
          error instanceof Error
            ? error.message
            : "The memo could not be restored right now.",
      });
    }
  };

  const handleDelete = async () => {
    if (!pendingRecordAction) return;

    const { record } = pendingRecordAction;

    try {
      await deleteMemoMutation.mutateAsync(record.id);
      toast({
        variant: "success",
        title: "Memo deleted",
        description: `${record.referenceNumber} has been permanently deleted.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "The memo could not be deleted right now.",
      });
    }
  };

  const handleReject = async (record: MemoAnnouncementRecord) => {
    try {
      await rejectMemoMutation.mutateAsync({ id: record.id });
      toast({
        variant: "success",
        title: "Officer draft rejected",
        description: `${record.referenceNumber} was returned as rejected and will not be delivered.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Rejection failed",
        description:
          error instanceof Error
            ? error.message
            : "The officer memo could not be rejected right now.",
      });
    }
  };

  const handleApprove = async (record: MemoAnnouncementRecord) => {
    try {
      await publishMemoMutation.mutateAsync({ id: record.id });
      toast({
        variant: "success",
        title: "Officer draft approved and published",
        description: `${record.referenceNumber} was delivered to its scoped recipients.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Approval failed",
        description:
          error instanceof Error
            ? error.message
            : "The officer memo could not be approved right now.",
      });
    }
  };

  const handleConfirmRecordAction = async () => {
    if (!pendingRecordAction) return;

    const { type, record } = pendingRecordAction;

    if (type === "archive") {
      await handleArchive(record);
    } else if (type === "restore") {
      await handleRestore(record);
    } else if (type === "reject") {
      await handleReject(record);
    } else if (type === "approve") {
      await handleApprove(record);
    } else {
      await handleDelete();
    }

    setPendingRecordAction(null);
  };

  const isRecordActionBusy =
    archiveMemoMutation.isPending ||
    restoreMemoMutation.isPending ||
    deleteMemoMutation.isPending ||
    rejectMemoMutation.isPending ||
    publishMemoMutation.isPending;

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Memo & Announcements
          </h1>
          <p className="text-muted-foreground text-sm">
            Organize official memos and announcement releases with signatories,
            browsing views, and publication history.
          </p>
        </div>
        <Button onClick={() => setIsTemplateDialogOpen(true)}>
          <Plus className="size-4" />
          Create memo
        </Button>
      </div>

      {hasNoRecords ? (
        <PageEmptyState
          title="No memos or announcements found"
          description="Create the first memo or announcement to start distributing official documents across the organization."
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Document Summary</CardTitle>
              <CardDescription>
                Quick view of published documents, signatories, and recent
                releases.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Documents"
                value={String(records.length)}
                subtitle="All memo files across the six template types"
                icon={<Files className="size-4" />}
                tone="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
              />
              <SummaryCard
                title="Template Types"
                value={String(memoTemplateOptions.length)}
                subtitle="Standard memo templates available"
                icon={<Shapes className="size-4" />}
                tone="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
              />
              <SummaryCard
                title="Announcements"
                value={String(announcementCount)}
                subtitle={`${customTemplateCount} using blank template`}
                icon={<FileStack className="size-4" />}
                tone="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
              />
              <SummaryCard
                title="Recipients"
                value={String(totalSignatories)}
                subtitle={`Latest issued ${latestIssuedLabel}`}
                icon={<Signature className="size-4" />}
                tone="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
              />
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            <CardHeader className="border-b">
              <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0 max-w-full overflow-hidden">
                  <Tabs
                    value={filter}
                    onValueChange={(value) => setFilter(value as MemoFilter)}
                    className="max-w-full overflow-hidden"
                  >
                    <div className="scrollbar-hide max-w-full overflow-x-auto overscroll-x-contain pb-1">
                      <TabsList
                        variant="line"
                        className="inline-flex min-w-max pr-2"
                      >
                        <TabsTrigger value="ALL">
                          All ({records.length})
                        </TabsTrigger>
                        {memoTemplateOptions.map((option) => {
                          const count = records.filter(
                            (record) => record.category === option.value,
                          ).length;

                          return (
                            <TabsTrigger key={option.value} value={option.value}>
                              {option.title} ({count})
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                    </div>
                  </Tabs>
                </div>

                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  className="shrink-0 justify-self-start lg:justify-self-end"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value === "grid" || value === "table") {
                      setViewMode(value);
                    }
                  }}
                  aria-label="Toggle memo view"
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <LayoutGrid className="size-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" aria-label="Table view">
                    <Rows3 className="size-4" />
                    <span className="hidden sm:inline">Table</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <PageLoadingState
                  mode={viewMode === "grid" ? "grid" : "table"}
                />
              ) : isError ? (
                <PageErrorState
                  title="Unable to load memo documents"
                  description={
                    error instanceof Error
                      ? error.message
                      : "Memo and announcement records could not be loaded right now."
                  }
                  backUrl="/dashboard"
                  backLabel="Back to dashboard"
                />
              ) : viewMode === "grid" ? (
                <MemoAnnouncementsGridView
                  data={filteredRecords}
                  onView={handleView}
                  onEdit={handleEdit}
                  onCopyId={handleCopyId}
                  onArchive={(record) =>
                    setPendingRecordAction({ type: "archive", record })
                  }
                  onRestore={(record) =>
                    setPendingRecordAction({ type: "restore", record })
                  }
                  onReject={(record) =>
                    setPendingRecordAction({ type: "reject", record })
                  }
                  onApprove={(record) =>
                    setPendingRecordAction({ type: "approve", record })
                  }
                  onDelete={(record) =>
                    setPendingRecordAction({ type: "delete", record })
                  }
                  isActionBusy={isRecordActionBusy}
                />
              ) : (
                <MemoAnnouncementsDataTable
                  data={filteredRecords}
                  onView={handleView}
                  onEdit={handleEdit}
                  onCopyId={handleCopyId}
                  onArchive={(record) =>
                    setPendingRecordAction({ type: "archive", record })
                  }
                  onRestore={(record) =>
                    setPendingRecordAction({ type: "restore", record })
                  }
                  onReject={(record) =>
                    setPendingRecordAction({ type: "reject", record })
                  }
                  onApprove={(record) =>
                    setPendingRecordAction({ type: "approve", record })
                  }
                  onDelete={(record) =>
                    setPendingRecordAction({ type: "delete", record })
                  }
                  isActionBusy={isRecordActionBusy}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}


      <AlertDialog
        open={Boolean(pendingRecordAction)}
        onOpenChange={(open) => {
          if (!open) setPendingRecordAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia
              className={
                pendingRecordAction?.type === "restore"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }
            >
              {pendingRecordAction?.type === "restore" ? (
                <RotateCcw className="size-8" />
              ) : pendingRecordAction?.type === "archive" ? (
                <Archive className="size-8" />
              ) : pendingRecordAction?.type === "reject" ? (
                <ShieldMinus className="size-8" />
              ) : pendingRecordAction?.type === "approve" ? (
                <Send className="size-8" />
              ) : (
                <Trash2 className="size-8" />
              )}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingRecordAction?.type === "restore"
                ? "Restore this memo?"
                : pendingRecordAction?.type === "archive"
                  ? "Archive this memo?"
                  : pendingRecordAction?.type === "reject"
                    ? "Reject this officer draft?"
                    : pendingRecordAction?.type === "approve"
                      ? "Approve and publish this officer draft?"
                  : "Delete this memo?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRecordAction?.type === "restore"
                ? `${pendingRecordAction.record.referenceNumber} will be restored to the memo list.`
                : pendingRecordAction?.type === "archive"
                  ? `${pendingRecordAction.record.referenceNumber} will be moved to archived memos and can be restored later.`
                  : pendingRecordAction?.type === "reject"
                    ? `${pendingRecordAction.record.referenceNumber} will not be delivered. The officer will see that it was rejected.`
                    : pendingRecordAction?.type === "approve"
                      ? `${pendingRecordAction.record.referenceNumber} will be approved and sent to its current scoped recipients.`
                  : pendingRecordAction
                    ? `${pendingRecordAction.record.referenceNumber} will be permanently deleted. This cannot be restored.`
                    : "Confirm this memo action."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRecordActionBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                pendingRecordAction?.type === "restore"
                  ? "default"
                  : "destructive"
              }
              disabled={isRecordActionBusy}
              onClick={() => void handleConfirmRecordAction()}
            >
              {isRecordActionBusy
                ? "Processing..."
                : pendingRecordAction?.type === "restore"
                  ? "Restore"
                  : pendingRecordAction?.type === "archive"
                    ? "Archive"
                    : pendingRecordAction?.type === "reject"
                      ? "Reject draft"
                      : pendingRecordAction?.type === "approve"
                        ? "Approve & publish"
                    : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <MemoTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      />
    </section>
  );
}

function MemoAnnouncementsGridView({
  data,
  onView,
  onEdit,
  onCopyId,
  onArchive,
  onRestore,
  onReject,
  onApprove,
  onDelete,
  isActionBusy,
}: {
  data: MemoAnnouncementRecord[];
  onView: (record: MemoAnnouncementRecord) => void;
  onEdit: (record: MemoAnnouncementRecord) => void;
  onCopyId: (record: MemoAnnouncementRecord) => Promise<void>;
  onArchive: (record: MemoAnnouncementRecord) => void;
  onRestore: (record: MemoAnnouncementRecord) => void;
  onReject: (record: MemoAnnouncementRecord) => void;
  onApprove: (record: MemoAnnouncementRecord) => void;
  onDelete: (record: MemoAnnouncementRecord) => void;
  isActionBusy: boolean;
}) {
  if (!data.length) {
    return (
      <PageEmptyState
        title="No matching documents found"
        description="Try another filter or create a new memo or announcement to populate this view."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {data.map((record) => (
        <Card
          key={record.id}
          className="group overflow-hidden border-border/70 bg-card py-0 shadow-xs transition-colors duration-200 hover:border-primary/40"
        >
          <div className="flex items-center justify-between px-3 pb-0! pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex rounded-md bg-red-500 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                PDF
              </span>
              <p className="truncate text-base font-medium">
                Ref. No. {record.referenceNumber}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => void onCopyId(record)}>
                  <Copy className="size-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(record)}>
                  <FileBadge2 className="size-4" />
                  View memo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(record)}>
                  <Edit className="size-4" />
                  Edit memo
                </DropdownMenuItem>
                {record.author?.role === "OFFICER" && record.status === "DRAFT" ? (
                  <>
                    <DropdownMenuItem
                      disabled={isActionBusy}
                      onClick={() => onApprove(record)}
                    >
                      <Send className="size-4" />
                      Approve & publish
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isActionBusy}
                      onClick={() => onReject(record)}
                    >
                      <ShieldMinus className="size-4" />
                      Reject officer draft
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                {record.status === "ARCHIVED" ? (
                  <DropdownMenuItem
                    disabled={isActionBusy}
                    onClick={() => onRestore(record)}
                  >
                    <RotateCcw className="size-4" />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isActionBusy}
                    onClick={() => onArchive(record)}
                  >
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isActionBusy}
                  onClick={() => onDelete(record)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-3 pb-4 pt-0">
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {record.category} / {record.status}
                  </p>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {record.title}
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-accent text-xs font-semibold">
                  {record.recipients.length}
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 w-11/12 rounded-full bg-accent" />
                <div className="h-2 w-full rounded-full bg-accent" />
                <div className="h-2 w-10/12 rounded-full bg-accent" />
                <div className="h-2 w-8/12 rounded-full bg-accent" />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>{formatMemoDate(record.publishedAt ?? record.createdAt)}</span>
                <span>
                  {record.recipients.length} recipient
                  {record.recipients.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
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
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </div>
  );
}
