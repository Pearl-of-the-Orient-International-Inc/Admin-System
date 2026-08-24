"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Copy,
  Edit,
  FileBadge2,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { MemoAnnouncementRecord } from "@/features/memo-announcements/memo-announcement.types";
import { formatMemoDateTime } from "./memo-announcements-data";

type MemoAnnouncementsDataTableProps = {
  data: MemoAnnouncementRecord[];
  onView: (record: MemoAnnouncementRecord) => void;
  onEdit: (record: MemoAnnouncementRecord) => void;
  onCopyId: (record: MemoAnnouncementRecord) => void;
  onArchive: (record: MemoAnnouncementRecord) => void;
  onRestore: (record: MemoAnnouncementRecord) => void;
  onDelete: (record: MemoAnnouncementRecord) => void;
  isActionBusy: boolean;
};

const columns: ColumnDef<MemoAnnouncementRecord>[] = [
  {
    accessorKey: "title",
    header: "Document",
    cell: ({ row }) => {
      const memo = row.original;

      return (
        <div className="space-y-1">
          <p className="font-medium leading-none">{memo.title}</p>
          <p className="text-muted-foreground text-xs">
            Ref. No. {memo.referenceNumber}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
  },
  {
    id: "recipients",
    header: "Recipients",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {row.original.recipients[0]?.name ?? "No recipient"}
        </p>
        <p className="text-muted-foreground text-xs">
          {row.original.recipients.length === 1
            ? "1 recipient"
            : `${row.original.recipients.length} recipients`}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    id: "author",
    header: "Issued By",
    cell: ({ row }) => row.original.author?.name ?? "Unknown",
  },
  {
    accessorKey: "publishedAt",
    header: "Issued",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatMemoDateTime(row.original.publishedAt ?? row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatMemoDateTime(row.original.updatedAt)}
      </span>
    ),
  },
];

export function MemoAnnouncementsDataTable({
  data,
  onView,
  onEdit,
  onCopyId,
  onArchive,
  onRestore,
  onDelete,
  isActionBusy,
}: MemoAnnouncementsDataTableProps) {
  return (
    <GlobalDataTable
      columns={columns}
      data={data}
      filterPlaceholder="Search memos and announcements..."
      emptyMessage="No memos or announcements found."
      exportFileName="memo-announcements"
      cellAction={(row) => {
        const memo = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCopyId(memo)}>
                <Copy className="size-4" />
                Copy Ref. No.
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(memo)}>
                <FileBadge2 className="size-4" />
                View memo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(memo)}>
                <Edit className="size-4" />
                Edit memo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {memo.status === "ARCHIVED" ? (
                <DropdownMenuItem
                  disabled={isActionBusy}
                  onClick={() => onRestore(memo)}
                >
                  <RotateCcw className="size-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isActionBusy}
                  onClick={() => onArchive(memo)}
                >
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                disabled={isActionBusy}
                onClick={() => onDelete(memo)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    />
  );
}
