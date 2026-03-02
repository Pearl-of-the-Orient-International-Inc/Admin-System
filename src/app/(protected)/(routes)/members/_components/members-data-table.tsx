"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-react";

import { GlobalDataTable } from "@/components/global-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MemberRecord } from "./members-data";

type MembersDataTableProps = {
  data: MemberRecord[];
  onDeleteMembers: (memberIds: string[]) => void;
};

export function MembersDataTable({ data, onDeleteMembers }: MembersDataTableProps) {
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
            Full Name
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
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
      },
      {
        accessorKey: "branchOfService",
        header: "Branch",
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
    []
  );

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search member name, email, branch, or status..."
      emptyMessage="No members found."
      exportFileName="members"
      onDeleteSelected={(rows) => onDeleteMembers(rows.map((row) => row.id))}
    />
  );
}
