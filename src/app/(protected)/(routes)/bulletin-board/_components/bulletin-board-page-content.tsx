"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Building2,
  CalendarClock,
  Edit,
  EyeOff,
  FileText,
  ImageIcon,
  Megaphone,
  MoreHorizontal,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  Send,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useArchiveBulletinEntryMutation,
  useBulletinEntriesQuery,
  useCreateBulletinEntryMutation,
  usePublishBulletinEntryMutation,
  useRestoreBulletinEntryMutation,
  useUnpublishBulletinEntryMutation,
  useUpdateBulletinEntryMutation,
  useUploadBulletinFileMutation,
} from "@/features/bulletins/bulletin.hooks";
import type {
  BulletinEntryPayload,
  BulletinEntryRecord,
  BulletinEntryStatus,
  BulletinEntryType,
} from "@/features/bulletins/bulletin.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

const surfaceClass =
  "border-border/60 bg-accent/30 text-foreground shadow-none backdrop-blur-sm";
const fieldClass =
  "border-border/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

const typeOptions: Array<{ value: BulletinEntryType; label: string }> = [
  { value: "NOTICE", label: "Notice" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "MEMO", label: "Memo" },
  { value: "EVENT", label: "Event" },
  { value: "OTHER", label: "Other" },
];

const statusOptions: Array<{
  value: Exclude<BulletinEntryStatus, "ARCHIVED">;
  label: string;
}> = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Publish now" },
  { value: "UNPUBLISHED", label: "Unpublished" },
];

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not set";

const formatDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const getPlainText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getFileNameFromUrl = (value: string, fallback: string) => {
  try {
    const fileName = decodeURIComponent(
      new URL(value).pathname.split("/").filter(Boolean).at(-1) ?? "",
    );
    return fileName || fallback;
  } catch {
    return fallback;
  }
};

type MediaSource = "LOCAL" | "URL";

const typeLabel = (type: BulletinEntryType) =>
  typeOptions.find((option) => option.value === type)?.label ?? type;

const statusClassNames: Record<BulletinEntryStatus, string> = {
  DRAFT:
    "border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  SCHEDULED:
    "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  PUBLISHED:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  UNPUBLISHED:
    "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ARCHIVED:
    "border-zinc-300 bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
};

export function BulletinBoardPageContent() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"ALL" | BulletinEntryStatus>(
    "ALL",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BulletinEntryRecord | null>(
    null,
  );
  const entriesQuery = useBulletinEntriesQuery({
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const publishMutation = usePublishBulletinEntryMutation();
  const unpublishMutation = useUnpublishBulletinEntryMutation();
  const archiveMutation = useArchiveBulletinEntryMutation();
  const restoreMutation = useRestoreBulletinEntryMutation();

  const entries = useMemo(
    () => entriesQuery.data?.data ?? [],
    [entriesQuery.data?.data],
  );
  const filteredEntries = useMemo(
    () =>
      statusFilter === "ALL"
        ? entries
        : entries.filter((entry) => entry.status === statusFilter),
    [entries, statusFilter],
  );

  const openCreate = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };
  const openEdit = (entry: BulletinEntryRecord) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const runAction = async (
    entry: BulletinEntryRecord,
    action: "publish" | "unpublish" | "archive" | "restore",
  ) => {
    try {
      if (action === "publish") await publishMutation.mutateAsync(entry.id);
      if (action === "unpublish") await unpublishMutation.mutateAsync(entry.id);
      if (action === "archive") await archiveMutation.mutateAsync(entry.id);
      if (action === "restore") await restoreMutation.mutateAsync(entry.id);

      toast({
        variant: "success",
        title: `Bulletin ${action === "publish" ? "published" : action === "unpublish" ? "unpublished" : action === "archive" ? "archived" : "restored"}`,
        description: entry.title,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Bulletin action failed",
        description: toApiError(error).message,
      });
    }
  };

  const isActionPending =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending;

  const columns = useMemo<ColumnDef<BulletinEntryRecord>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Bulletin Entry",
        cell: ({ row }) => (
          <div className="max-w-md space-y-1">
            <p className="font-medium">{row.original.title}</p>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {getPlainText(row.original.content)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline">{typeLabel(row.original.type)}</Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={statusClassNames[row.original.status]}
          >
            {row.original.status.toLowerCase().replace("_", " ")}
          </Badge>
        ),
      },
      {
        id: "issuer",
        header: "Issued By",
        cell: ({ row }) =>
          row.original.issuingOffice ||
          row.original.authorName ||
          row.original.authorUser?.name ||
          "Not specified",
      },
      {
        id: "publication",
        header: "Publication",
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(
              row.original.status === "SCHEDULED"
                ? row.original.scheduledAt
                : row.original.publicationDate,
            )}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.updatedAt)}</span>
        ),
      },
    ],
    [],
  );

  const publishedCount = entries.filter(
    (entry) => entry.status === "PUBLISHED",
  ).length;
  const scheduledCount = entries.filter(
    (entry) => entry.status === "SCHEDULED",
  ).length;
  const draftCount = entries.filter((entry) => entry.status === "DRAFT").length;

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bulletin Board
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and control public notices, announcements, memos, events, and
            other approved bulletin entries.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Create entry
        </Button>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Publishing Summary</CardTitle>
          <CardDescription>
            Current bulletin workload and public publication status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="Total Entries"
            value={entries.length}
            description="All bulletin records"
            icon={<Megaphone className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Published"
            value={publishedCount}
            description="Visible on public channels"
            icon={<Send className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Scheduled"
            value={scheduledCount}
            description="Waiting for automatic release"
            icon={<CalendarClock className="size-4" />}
            accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryStatCard
            label="Drafts"
            value={draftCount}
            description="Still being prepared"
            icon={<FileText className="size-4" />}
            accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Bulletin Directory</CardTitle>
          <CardDescription>
            Review entries and manage their publishing lifecycle.
          </CardDescription>
          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "ALL" | BulletinEntryStatus)
            }
          >
            <div className="scrollbar-hide overflow-x-auto pt-2">
              <TabsList variant="line" className="min-w-max">
                <TabsTrigger value="ALL">All ({entries.length})</TabsTrigger>
                {(
                  [
                    "DRAFT",
                    "SCHEDULED",
                    "PUBLISHED",
                    "UNPUBLISHED",
                    "ARCHIVED",
                  ] as BulletinEntryStatus[]
                ).map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()} (
                    {entries.filter((entry) => entry.status === status).length})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          {entriesQuery.isLoading ? (
            <PageLoadingState mode="table" />
          ) : entriesQuery.isError ? (
            <PageErrorState
              title="Unable to load bulletin entries"
              description={
                toApiError(entriesQuery.error).message ??
                "Bulletin entries could not be loaded right now."
              }
              backUrl="/dashboard"
              backLabel="Back to dashboard"
            />
          ) : entries.length === 0 ? (
            <PageEmptyState
              title="No bulletin entries found"
              description="Create the first bulletin entry for publication on public channels."
              createAction={openCreate}
              createLabel="Create entry"
            />
          ) : (
            <GlobalDataTable
              columns={columns}
              data={filteredEntries}
              filterPlaceholder="Search bulletin entries..."
              emptyMessage="No bulletin entries match this status."
              exportFileName="bulletin-board"
              cellAction={(row) => {
                const entry = row.original;
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Open bulletin actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {entry.status !== "ARCHIVED" ? (
                        <DropdownMenuItem onClick={() => openEdit(entry)}>
                          <Edit className="size-4" />
                          Edit entry
                        </DropdownMenuItem>
                      ) : null}
                      {entry.status !== "PUBLISHED" &&
                      entry.status !== "ARCHIVED" ? (
                        <DropdownMenuItem
                          disabled={isActionPending}
                          onClick={() => void runAction(entry, "publish")}
                        >
                          <Send className="size-4" />
                          Publish now
                        </DropdownMenuItem>
                      ) : null}
                      {entry.status === "PUBLISHED" ||
                      entry.status === "SCHEDULED" ? (
                        <DropdownMenuItem
                          disabled={isActionPending}
                          onClick={() => void runAction(entry, "unpublish")}
                        >
                          <EyeOff className="size-4" />
                          Unpublish
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {entry.status === "ARCHIVED" ? (
                        <DropdownMenuItem
                          disabled={isActionPending}
                          onClick={() => void runAction(entry, "restore")}
                        >
                          <RotateCcw className="size-4" />
                          Restore as draft
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={isActionPending}
                          onClick={() => void runAction(entry, "archive")}
                        >
                          <Archive className="size-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }}
            />
          )}
        </CardContent>
      </Card>

      <BulletinEntrySheet
        key={`${editingEntry?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        entry={editingEntry}
        onOpenChange={setFormOpen}
      />
    </section>
  );
}

function BulletinEntrySheet({
  open,
  entry,
  onOpenChange,
}: {
  open: boolean;
  entry: BulletinEntryRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreateBulletinEntryMutation();
  const updateMutation = useUpdateBulletinEntryMutation();
  const uploadMutation = useUploadBulletinFileMutation();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [type, setType] = useState<BulletinEntryType>(entry?.type ?? "NOTICE");
  const [status, setStatus] = useState<
    Exclude<BulletinEntryStatus, "ARCHIVED">
  >(entry?.status === "ARCHIVED" ? "DRAFT" : (entry?.status ?? "DRAFT"));
  const [scheduledAt, setScheduledAt] = useState(
    formatDateTimeInput(entry?.scheduledAt ?? null),
  );
  const [authorName, setAuthorName] = useState(entry?.authorName ?? "");
  const [issuingOffice, setIssuingOffice] = useState(
    entry?.issuingOffice ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [imageSource, setImageSource] = useState<MediaSource>("LOCAL");
  const [attachmentSource, setAttachmentSource] =
    useState<MediaSource>("LOCAL");
  const [remoteImageUrl, setRemoteImageUrl] = useState(
    entry?.featuredImageUrl ?? "",
  );
  const [remoteAttachmentUrl, setRemoteAttachmentUrl] = useState(
    entry?.attachmentUrl ?? "",
  );
  const imagePreviewUrl = useMemo(
    () =>
      imageSource === "URL"
        ? remoteImageUrl.trim() || null
        : imageFile
          ? URL.createObjectURL(imageFile)
          : (entry?.featuredImageUrl ?? null),
    [entry?.featuredImageUrl, imageFile, imageSource, remoteImageUrl],
  );

  useEffect(
    () => () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    },
    [imagePreviewUrl],
  );

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;

  const handleSubmit = async () => {
    if (!title.trim() || !getPlainText(content)) {
      toast({
        variant: "error",
        title: "Complete required fields",
        description: "Title and content are required.",
      });
      return;
    }
    if (content.length > 20_000) {
      toast({
        variant: "error",
        title: "Bulletin content is too long",
        description: "Reduce the formatted content to 20,000 characters.",
      });
      return;
    }
    if (!authorName.trim() && !issuingOffice.trim()) {
      toast({
        variant: "error",
        title: "Add publication ownership",
        description: "Enter an author or issuing office.",
      });
      return;
    }
    if (status === "SCHEDULED" && !scheduledAt) {
      toast({
        variant: "error",
        title: "Add a schedule",
        description: "Choose when this bulletin entry should be published.",
      });
      return;
    }
    if (
      imageSource === "URL" &&
      remoteImageUrl.trim() &&
      !isValidHttpUrl(remoteImageUrl.trim())
    ) {
      toast({
        variant: "error",
        title: "Invalid image URL",
        description: "Enter a complete URL beginning with http:// or https://.",
      });
      return;
    }
    if (
      attachmentSource === "URL" &&
      remoteAttachmentUrl.trim() &&
      !isValidHttpUrl(remoteAttachmentUrl.trim())
    ) {
      toast({
        variant: "error",
        title: "Invalid attachment URL",
        description: "Enter a complete URL beginning with http:// or https://.",
      });
      return;
    }

    try {
      let featuredImageUrl = entry?.featuredImageUrl ?? null;
      let featuredImageFileName = entry?.featuredImageFileName ?? null;
      let attachmentUrl = entry?.attachmentUrl ?? null;
      let attachmentFileName = entry?.attachmentFileName ?? null;
      let attachmentMimeType = entry?.attachmentMimeType ?? null;

      if (imageSource === "URL") {
        featuredImageUrl = remoteImageUrl.trim() || null;
        featuredImageFileName = featuredImageUrl
          ? getFileNameFromUrl(featuredImageUrl, "featured-image")
          : null;
      } else if (imageFile) {
        const upload = await uploadMutation.mutateAsync(imageFile);
        featuredImageUrl = upload?.serverData.fileUrl ?? upload?.ufsUrl ?? null;
        featuredImageFileName = upload?.serverData.fileName ?? imageFile.name;
      }
      if (attachmentSource === "URL") {
        attachmentUrl = remoteAttachmentUrl.trim() || null;
        attachmentFileName = attachmentUrl
          ? getFileNameFromUrl(attachmentUrl, "bulletin-attachment.pdf")
          : null;
        attachmentMimeType = attachmentUrl ? "application/pdf" : null;
      } else if (attachmentFile) {
        const upload = await uploadMutation.mutateAsync(attachmentFile);
        attachmentUrl = upload?.serverData.fileUrl ?? upload?.ufsUrl ?? null;
        attachmentFileName = upload?.serverData.fileName ?? attachmentFile.name;
        attachmentMimeType = upload?.serverData.mimeType ?? attachmentFile.type;
      }

      const payload: BulletinEntryPayload = {
        title: title.trim(),
        content: content.trim(),
        type,
        status,
        scheduledAt:
          status === "SCHEDULED" ? new Date(scheduledAt).toISOString() : null,
        publicationDate: entry?.publicationDate ?? null,
        authorName: authorName.trim() || null,
        issuingOffice: issuingOffice.trim() || null,
        featuredImageUrl,
        featuredImageFileName,
        attachmentUrl,
        attachmentFileName,
        attachmentMimeType,
      };

      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      toast({
        variant: "success",
        title: entry ? "Bulletin entry updated" : "Bulletin entry created",
        description:
          status === "PUBLISHED"
            ? "The entry is now visible on public bulletin channels."
            : status === "SCHEDULED"
              ? "The entry will publish automatically at the scheduled time."
              : "The bulletin entry was saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: entry ? "Update failed" : "Creation failed",
        description: toApiError(error).message,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="no-scrollbar w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {entry ? "Edit bulletin entry" : "Create bulletin entry"}
          </SheetTitle>
          <SheetDescription>
            Complete the bulletin details here. Only published entries appear on
            public channels.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <FormSectionHeading
                icon={Megaphone}
                title="Bulletin Identity"
                description="Add a clear title and the approved bulletin content."
              />
              <div className="grid gap-2">
                <Label htmlFor="bulletin-title">Title</Label>
                <Input
                  id="bulletin-title"
                  value={title}
                  maxLength={200}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter a concise bulletin title"
                  className={cn(fieldClass, "h-11 rounded-lg")}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="bulletin-content">Content</Label>
                  <span className="text-muted-foreground text-xs">
                    {getPlainText(content).length.toLocaleString()} characters
                  </span>
                </div>
                <div id="bulletin-content">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write the approved bulletin content..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <FormSectionHeading
                icon={CalendarClock}
                title="Publication Settings"
                description="Choose the bulletin category and when it should become visible."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Entry type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType(value as BulletinEntryType)
                    }
                  >
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Publication status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(
                        value as Exclude<BulletinEntryStatus, "ARCHIVED">,
                      )
                    }
                  >
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status === "SCHEDULED" ? (
                <div className="grid gap-2">
                  <Label htmlFor="bulletin-schedule">Publish on</Label>
                  <Input
                    id="bulletin-schedule"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className={cn(fieldClass, "h-11 rounded-lg")}
                  />
                  <p className="text-muted-foreground text-xs">
                    The entry remains hidden until this date and time.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <FormSectionHeading
                icon={UserRound}
                title="Publication Ownership"
                description="Identify the person or office responsible for this entry."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bulletin-author">Author</Label>
                  <Input
                    id="bulletin-author"
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    placeholder="Author name"
                    className={cn(fieldClass, "h-11 rounded-lg")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bulletin-office">Issuing office</Label>
                  <Input
                    id="bulletin-office"
                    value={issuingOffice}
                    onChange={(event) => setIssuingOffice(event.target.value)}
                    placeholder="Communications Office"
                    className={cn(fieldClass, "h-11 rounded-lg")}
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl border bg-background/60 p-3 text-xs text-muted-foreground">
                <Building2 className="mt-0.5 size-4 shrink-0" />
                Enter at least one author or issuing office.
              </div>
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <FormSectionHeading
                icon={Upload}
                title="Media Attachments"
                description="Add an optional featured image and supporting PDF document."
              />

              <Input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
              />
              <Input
                ref={attachmentInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) =>
                  setAttachmentFile(event.target.files?.[0] ?? null)
                }
              />

              <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Featured image</p>
                    <p className="text-muted-foreground text-xs">
                      Upload an image or paste a direct internet image URL.
                    </p>
                  </div>
                  <MediaSourceSelector
                    value={imageSource}
                    onChange={setImageSource}
                  />
                </div>
                {imageSource === "LOCAL" ? (
                  <MediaPickerButton
                    icon={ImageIcon}
                    label="Choose from device"
                    fileName={
                      imageFile?.name ??
                      entry?.featuredImageFileName ??
                      "No image selected"
                    }
                    onClick={() => imageInputRef.current?.click()}
                  />
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="bulletin-image-url">Image URL</Label>
                    <Input
                      id="bulletin-image-url"
                      type="url"
                      value={remoteImageUrl}
                      onChange={(event) =>
                        setRemoteImageUrl(event.target.value)
                      }
                      placeholder="https://images.unsplash.com/..."
                      className={cn(fieldClass, "h-11 rounded-lg")}
                    />
                  </div>
                )}
              </div>

              {imagePreviewUrl ? (
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="relative aspect-[2/1] bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt={imageFile?.name ?? "Bulletin featured image"}
                      className="h-full w-full object-cover"
                    />
                    {imageSource === "LOCAL" && imageFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          if (imageInputRef.current) {
                            imageInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-3 right-3 rounded-full bg-background/90 p-1.5 shadow"
                        aria-label="Remove selected image"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 p-3">
                    <ImageIcon className="size-4 text-muted-foreground" />
                    <p className="min-w-0 truncate text-sm font-medium">
                      {imageSource === "URL"
                        ? getFileNameFromUrl(remoteImageUrl, "Internet image")
                        : (imageFile?.name ?? entry?.featuredImageFileName)}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">PDF attachment</p>
                    <p className="text-muted-foreground text-xs">
                      Upload from your device or link to a PDF on the internet.
                    </p>
                  </div>
                  <MediaSourceSelector
                    value={attachmentSource}
                    onChange={setAttachmentSource}
                  />
                </div>
                {attachmentSource === "LOCAL" ? (
                  <MediaPickerButton
                    icon={Paperclip}
                    label="Choose from device"
                    fileName={
                      attachmentFile?.name ??
                      entry?.attachmentFileName ??
                      "No PDF selected"
                    }
                    onClick={() => attachmentInputRef.current?.click()}
                  />
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="bulletin-attachment-url">PDF URL</Label>
                    <Input
                      id="bulletin-attachment-url"
                      type="url"
                      value={remoteAttachmentUrl}
                      onChange={(event) =>
                        setRemoteAttachmentUrl(event.target.value)
                      }
                      placeholder="https://example.org/document.pdf"
                      className={cn(fieldClass, "h-11 rounded-lg")}
                    />
                  </div>
                )}
              </div>

              {(attachmentSource === "URL" && remoteAttachmentUrl.trim()) ||
              (attachmentSource === "LOCAL" &&
                (attachmentFile || entry?.attachmentFileName)) ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-background/70 p-2">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {attachmentSource === "URL"
                          ? getFileNameFromUrl(
                              remoteAttachmentUrl,
                              "Internet PDF",
                            )
                          : (attachmentFile?.name ?? entry?.attachmentFileName)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PDF attachment
                      </p>
                    </div>
                  </div>
                  {attachmentSource === "LOCAL" && attachmentFile ? (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setAttachmentFile(null);
                        if (attachmentInputRef.current) {
                          attachmentInputRef.current.value = "";
                        }
                      }}
                      aria-label="Remove selected PDF"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-card/60 p-5 text-sm text-muted-foreground">
                  No media attached. Attachments are optional.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="sticky bottom-0 isolate flex items-center justify-end gap-2 bg-background py-4 after:pointer-events-none after:absolute after:bottom-full after:-z-10 after:h-10 after:w-full after:bg-linear-to-t after:from-background after:to-transparent">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={() => void handleSubmit()}>
              <Save className="size-4" />
              {isPending
                ? "Saving..."
                : entry
                  ? "Save changes"
                  : "Create entry"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FormSectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Megaphone;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-background/70 p-2">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function MediaSourceSelector({
  value,
  onChange,
}: {
  value: MediaSource;
  onChange: (value: MediaSource) => void;
}) {
  return (
    <div
      className="bg-muted flex w-fit rounded-lg p-1"
      role="group"
      aria-label="Media source"
    >
      <Button
        type="button"
        size="sm"
        variant={value === "LOCAL" ? "secondary" : "ghost"}
        className="h-7 rounded-md px-3 text-xs"
        onClick={() => onChange("LOCAL")}
      >
        Local upload
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "URL" ? "secondary" : "ghost"}
        className="h-7 rounded-md px-3 text-xs"
        onClick={() => onChange("URL")}
      >
        Internet URL
      </Button>
    </div>
  );
}

function MediaPickerButton({
  icon: Icon,
  label,
  fileName,
  onClick,
}: {
  icon: typeof ImageIcon;
  label: string;
  fileName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent/60 flex w-full min-w-0 items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-colors"
    >
      <div className="rounded-lg bg-background p-2">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground truncate text-xs">{fileName}</p>
      </div>
    </button>
  );
}
