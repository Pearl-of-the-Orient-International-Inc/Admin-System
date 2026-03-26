"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Copy, Edit, FileBadge2, MoreHorizontal } from "lucide-react";

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
import {
  formatMemoDateTime,
  type MemoAnnouncementRecord,
} from "./memo-announcements-data";

type MemoAnnouncementsDataTableProps = {
  data: MemoAnnouncementRecord[];
  onView: (record: MemoAnnouncementRecord) => void;
  onEdit: (record: MemoAnnouncementRecord) => void;
  onCopyId: (record: MemoAnnouncementRecord) => void;
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
          <p className="text-muted-foreground text-xs">{memo.fileName}</p>
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
    id: "signatories",
    header: "Signatories",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="text-sm font-medium">{row.original.signatories[0]}</p>
        <p className="text-muted-foreground text-xs">
          {row.original.signatories.length === 1
            ? "1 signatory"
            : `${row.original.signatories.length} signatories`}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "author",
    header: "Issued By",
  },
  {
    accessorKey: "issuedAt",
    header: "Issued",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatMemoDateTime(row.original.issuedAt)}
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
                Copy ID
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
              <DropdownMenuItem variant="destructive">
                <Archive className="size-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    />
  );
}
