"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Download,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  QrCode,
  RotateCcw,
  ShieldMinus,
  Archive,
  Edit,
} from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberRecord } from "./members-data";
import Image from "next/image";

type MembersDataTableProps = {
  data: MemberRecord[];
  bulkActionLabel: "Archive" | "Retrieve";
  isBatchQrPending?: boolean;
  isBulkActionPending?: boolean;
  isRowArchiveActionPending?: boolean;
  onBatchDownloadQrCodes: (members: MemberRecord[]) => void;
  onRequestBulkAction: (memberIds: string[]) => void;
  onViewDetails: (member: MemberRecord) => void;
  onEditDetails: (member: MemberRecord) => void;
  onAssignOffice: (member: MemberRecord) => void;
  onRequestToggleMemberArchiveState: (member: MemberRecord) => void;
  onGenerateQrCode: (member: MemberRecord) => void;
};

export function MembersDataTable({
  data,
  bulkActionLabel,
  isBatchQrPending = false,
  isBulkActionPending = false,
  isRowArchiveActionPending = false,
  onBatchDownloadQrCodes,
  onRequestBulkAction,
  onViewDetails,
  onEditDetails,
  onAssignOffice,
  onRequestToggleMemberArchiveState,
  onGenerateQrCode,
}: MembersDataTableProps) {
  const columns = useMemo<ColumnDef<MemberRecord>[]>(
    () => [
      {
        accessorKey: "uniqueId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Member ID
            <ArrowDownUp className="size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full Name
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border bg-background">
              {row.original.avatarUrl ? (
                <AvatarImage
                  src={row.original.avatarUrl}
                  alt={row.original.fullName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-slate-600 text-sm font-semibold text-white">
                {getMemberInitials(row.original.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.fullName}</p>
              <p className="text-muted-foreground text-xs">
                Badge No.: {row.original.badgeNumber || "N/A"}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "memberType",
        header: "Member Type",
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          if (row.original.status === "Approved") {
            return <Badge variant="success">Approved</Badge>;
          }
          if (row.original.status === "Pending") {
            return <Badge variant="warning">Pending</Badge>;
          }
          if (row.original.status === "Rejected") {
            return <Badge variant="error">Rejected</Badge>;
          }
          return <Badge variant="error">Archived</Badge>;
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Applied At",
        cell: ({ row }) =>
          new Date(row.original.appliedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
    ],
    [],
  );

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex-col p-6 flex min-h-60 items-center justify-center rounded-xl border border-dashed">
        <Image
          src="/svg-vector/empty-state.svg"
          alt="No data found"
          width={200}
          height={200}
        />
        <div className="space-y-1 text-center mt-10">
          <p className="font-semibold text-lg">No members found.</p>
          <p className="text-muted-foreground">
            Get started by adding a new member manually or importing your data
            via Excel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search member name, email, branch, or status..."
      emptyMessage="No members found."
      exportFileName="members"
      renderSelectedActions={(rows, { clearSelection }) => (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchDownloadQrCodes(rows)}
            disabled={isBatchQrPending || isBulkActionPending}
          >
            {isBatchQrPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {isBatchQrPending ? "Preparing..." : "Download QR Codes"}
          </Button>
          <Button
            variant={bulkActionLabel === "Archive" ? "destructive" : "outline"}
            size="sm"
            onClick={() => {
              onRequestBulkAction(rows.map((row) => row.memberId));
              clearSelection();
            }}
            disabled={isBulkActionPending || isBatchQrPending}
          >
            {isBulkActionPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : bulkActionLabel === "Archive" ? (
              <Archive className="size-4" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            {isBulkActionPending
              ? bulkActionLabel === "Archive"
                ? "Archiving..."
                : "Retrieving..."
              : bulkActionLabel}
          </Button>
        </>
      )}
      cellAction={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open member actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditDetails(row.original)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
              <Eye className="size-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAssignOffice(row.original)}
              disabled={row.original.status === "Archived"}
            >
              <BriefcaseBusiness className="size-4" />
              Manage offices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerateQrCode(row.original)}>
              <QrCode className="size-4" />
              Generate QR code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRequestToggleMemberArchiveState(row.original)}
              variant={
                row.original.status === "Archived" ? "default" : "destructive"
              }
              disabled={isRowArchiveActionPending}
            >
              {isRowArchiveActionPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : row.original.status === "Archived" ? (
                <RotateCcw className="size-4" />
              ) : (
                <ShieldMinus className="size-4" />
              )}
              {isRowArchiveActionPending
                ? row.original.status === "Archived"
                  ? "Retrieving..."
                  : "Suspending..."
                : row.original.status === "Archived"
                  ? "Retrieve member"
                  : "Suspend member"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
