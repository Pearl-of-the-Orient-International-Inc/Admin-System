"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
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
  ChevronsUpDown,
} from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { MemberType } from "@/enums";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  memberTypeFilterOptions,
  type MemberRecord,
} from "./members-data";
import Image from "next/image";

type MembersDataTableProps = {
  data: MemberRecord[];
  bulkActionLabel: "Archive" | "Retrieve";
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
  isBatchQrPending?: boolean;
  isBulkActionPending?: boolean;
  isRowArchiveActionPending?: boolean;
  updatingMemberTypeId?: string | null;
  updatingMemberStatusId?: string | null;
  onBatchDownloadQrCodes: (members: MemberRecord[]) => void;
  onRequestBulkAction: (memberIds: string[]) => void;
  onViewDetails: (member: MemberRecord) => void;
  onEditDetails: (member: MemberRecord) => void;
  onAssignOffice: (member: MemberRecord) => void;
  onRequestToggleMemberArchiveState: (member: MemberRecord) => void;
  onGenerateQrCode: (member: MemberRecord) => void;
  onUpdateMemberType: (
    member: MemberRecord,
    memberType: MemberType,
  ) => Promise<void>;
  onUpdateMemberStatus: (
    member: MemberRecord,
    status: EditableMemberStatus,
  ) => Promise<void>;
};

export function MembersDataTable({
  data,
  bulkActionLabel,
  sorting,
  onSortingChange,
  isBatchQrPending = false,
  isBulkActionPending = false,
  isRowArchiveActionPending = false,
  updatingMemberTypeId = null,
  updatingMemberStatusId = null,
  onBatchDownloadQrCodes,
  onRequestBulkAction,
  onViewDetails,
  onEditDetails,
  onAssignOffice,
  onRequestToggleMemberArchiveState,
  onGenerateQrCode,
  onUpdateMemberType,
  onUpdateMemberStatus,
}: MembersDataTableProps) {
  const [editingMemberTypeId, setEditingMemberTypeId] = useState<string | null>(
    null,
  );
  const [editingMemberStatusId, setEditingMemberStatusId] = useState<string | null>(
    null,
  );

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
              <AvatarFallback className="bg-green-600 text-sm font-semibold text-white">
                {getMemberInitials(row.original.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium uppercase">{row.original.fullName}</p>
              <p className="text-muted-foreground text-xs">
                Badge No.: {row.original.badgeNumber || "N/A"}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "memberType",
        header: "Member Type",
        cell: ({ row }) => (
          <EditableMemberTypeCell
            member={row.original}
            isEditing={editingMemberTypeId === row.original.memberId}
            isPending={updatingMemberTypeId === row.original.memberId}
            onStartEditing={() => setEditingMemberTypeId(row.original.memberId)}
            onCancelEditing={() => setEditingMemberTypeId(null)}
            onSave={async (memberType) => {
              await onUpdateMemberType(row.original, memberType);
              setEditingMemberTypeId(null);
            }}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return (
            <EditableStatusCell
              member={row.original}
              isEditing={editingMemberStatusId === row.original.memberId}
              isPending={updatingMemberStatusId === row.original.memberId}
              onStartEditing={() => setEditingMemberStatusId(row.original.memberId)}
              onCancelEditing={() => setEditingMemberStatusId(null)}
              onSave={async (status) => {
                await onUpdateMemberStatus(row.original, status);
                setEditingMemberStatusId(null);
              }}
            />
          );
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Application Date",
        cell: ({ row }) =>
          new Date(row.original.appliedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
    ],
    [
      editingMemberStatusId,
      editingMemberTypeId,
      onUpdateMemberStatus,
      onUpdateMemberType,
      updatingMemberStatusId,
      updatingMemberTypeId,
    ],
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
      hideSearch
      hideFooter
      manualSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      filterPlaceholder="Search member name, email, branch, or status..."
      emptyMessage="No members found."
      exportFileName="members"
      renderSelectedActions={(rows, { clearSelection }) => (
        <>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onBatchDownloadQrCodes(rows)}
            disabled={isBatchQrPending || isBulkActionPending}
          >
            {isBatchQrPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {isBatchQrPending ? "Preparing..." : "Download QR Codes"}
          </Button>
          <Button
            variant={bulkActionLabel === "Archive" ? "destructive" : "outline"}
            size="xs"
            onClick={() => {
              onRequestBulkAction(rows.map((row) => row.memberId));
              clearSelection();
            }}
            disabled={isBulkActionPending || isBatchQrPending}
          >
            {isBulkActionPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : bulkActionLabel === "Archive" ? (
              <Archive className="size-3.5" />
            ) : (
              <RotateCcw className="size-3.5" />
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

type EditableMemberStatus = "Approved" | "Pending" | "Rejected" | "Archived";

function EditableMemberTypeCell({
  member,
  isEditing,
  isPending,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  member: MemberRecord;
  isEditing: boolean;
  isPending: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (memberType: MemberType) => Promise<void>;
}) {
  if (isEditing) {
    return (
      <div className="max-w-40 truncate">
        <Select
          open
          value={member.memberTypeValue}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              onCancelEditing();
            }
          }}
          onValueChange={(value) => {
            void onSave(value as MemberType);
          }}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select member type" />
          </SelectTrigger>
          <SelectContent>
            {memberTypeFilterOptions.map((memberType) => (
              <SelectItem key={memberType.value} value={memberType.value}>
                {memberType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-muted"
      onDoubleClick={() => {
        onStartEditing();
      }}
      disabled={isPending}
      title="Double-click to edit member type"
    >
      <span className="truncate max-w-40">{member.memberType}</span>
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

function EditableStatusCell({
  member,
  isEditing,
  isPending,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  member: MemberRecord;
  isEditing: boolean;
  isPending: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (status: EditableMemberStatus) => Promise<void>;
}) {
  if (isEditing) {
    return (
      <div className="min-w-40">
        <Select
          open
          value={member.status}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              onCancelEditing();
            }
          }}
          onValueChange={(value) => {
            void onSave(value as EditableMemberStatus);
          }}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MEMBER_STATUS_OPTIONS.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
                disabled={status.value === "Pending"}
              >
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-muted"
      onDoubleClick={() => onStartEditing()}
      disabled={isPending}
      title="Double-click to edit status"
    >
      {renderStatusBadge(member.status)}
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

function renderStatusBadge(status: EditableMemberStatus) {
  if (status === "Approved") {
    return <Badge variant="success">Approved</Badge>;
  }
  if (status === "Pending") {
    return <Badge variant="warning">Pending</Badge>;
  }
  if (status === "Rejected") {
    return <Badge variant="error">Rejected</Badge>;
  }
  return <Badge variant="error">Archived</Badge>;
}

const MEMBER_STATUS_OPTIONS: Array<{
  value: EditableMemberStatus;
  label: string;
}> = [
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
  { value: "Archived", label: "Archived" },
];

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
