"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, Check, Trash2 } from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import type { MemberRecord } from "../../_components/members-data";

type PendingMembersDataTableProps = {
  data: MemberRecord[];
  onApprove: (memberId: string) => void;
  onRequestDecline: (memberId: string) => void;
};

export function PendingMembersDataTable({
  data,
  onApprove,
  onRequestDecline,
}: PendingMembersDataTableProps) {
  const columns = useMemo<ColumnDef<MemberRecord>[]>(
    () => [
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
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-muted-foreground text-xs">{row.original.id}</p>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "civilStatus", header: "Civil Status" },
      { accessorKey: "branchOfService", header: "Branch of Service" },
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
    []
  );

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search pending members by name, email, mobile, or branch..."
      emptyMessage="No pending applications."
      exportFileName="pending-member-applications"
      cellAction={(row) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="default"
            onClick={() => onApprove(row.original.id)}
          >
            <Check className="size-3.5" />
            Approve
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() => onRequestDecline(row.original.id)}
          >
            <Trash2 className="size-3.5" />
            Decline
          </Button>
        </div>
      )}
    />
  );
}
