"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, Check, Eye, LoaderCircle, Trash2 } from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MemberRecord } from "../../_components/members-data";

type PendingMembersDataTableProps = {
  data: MemberRecord[];
  onViewApplicant: (member: MemberRecord) => void;
  pendingActionMemberId?: string | null;
  pendingActionType?: "approve" | "decline" | null;
  isBulkApprovePending?: boolean;
  onApprove: (memberId: string) => void;
  onBulkApprove: (memberIds: string[]) => void;
  onRequestDecline: (memberId: string) => void;
};

export function PendingMembersDataTable({
  data,
  onViewApplicant,
  pendingActionMemberId = null,
  pendingActionType = null,
  isBulkApprovePending = false,
  onApprove,
  onBulkApprove,
  onRequestDecline,
}: PendingMembersDataTableProps) {
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
            Applicant
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
              <div className="group flex items-center gap-2">
                <p className="font-medium uppercase">{row.original.fullName}</p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => onViewApplicant(row.original)}
                >
                  <Eye className="size-4" />
                </Button>
              </div>
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
      },
      { accessorKey: "mobile", header: "Mobile" },
      {
        accessorKey: "status",
        header: "Status",
        cell: () => <Badge variant="warning">Pending</Badge>,
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
    [onViewApplicant],
  );

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search pending members by name, email, branch, or status..."
      emptyMessage="No pending applications."
      exportFileName="pending-member-applications"
      renderSelectedActions={(rows, { clearSelection }) => (
        <Button
          size="xs"
          variant="default"
          disabled={isBulkApprovePending || Boolean(pendingActionMemberId)}
          onClick={() => {
            onBulkApprove(rows.map((row) => row.id));
            clearSelection();
          }}
        >
          {isBulkApprovePending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {isBulkApprovePending ? "Approving..." : "Approve Selected"}
        </Button>
      )}
      cellAction={(row) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="default"
            onClick={() => onApprove(row.original.id)}
            disabled={Boolean(pendingActionMemberId) || isBulkApprovePending}
          >
            {pendingActionMemberId === row.original.id &&
            pendingActionType === "approve" ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            {pendingActionMemberId === row.original.id &&
            pendingActionType === "approve"
              ? "Approving..."
              : "Approve"}
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() => onRequestDecline(row.original.id)}
            disabled={Boolean(pendingActionMemberId) || isBulkApprovePending}
          >
            {pendingActionMemberId === row.original.id &&
            pendingActionType === "decline" ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {pendingActionMemberId === row.original.id &&
            pendingActionType === "decline"
              ? "Declining..."
              : "Decline"}
          </Button>
        </div>
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
