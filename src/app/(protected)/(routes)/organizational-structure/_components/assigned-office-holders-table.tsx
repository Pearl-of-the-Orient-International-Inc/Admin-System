"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OfficerAssignmentResource } from "@/features/officer-assignment/officer-assignment.types";

type AssignedOfficeHolderRecord = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  officeTitle: string;
  officeLevel: string;
  jurisdiction: string;
  startedAt: string;
};

export function AssignedOfficeHoldersTable({
  data,
}: {
  data: OfficerAssignmentResource[];
}) {
  const rows = useMemo<AssignedOfficeHolderRecord[]>(
    () =>
      data
        .filter((assignment) => assignment.member)
        .map((assignment) => ({
          id: assignment.id,
          fullName: [
            assignment.member?.firstName,
            assignment.member?.middleInitial?.trim(),
            assignment.member?.lastName,
            assignment.member?.extensionName?.trim(),
          ]
            .filter(Boolean)
            .join(" "),
          email: assignment.member?.user.email ?? "No email",
          avatarUrl: assignment.member?.user.avatar ?? null,
          officeTitle: assignment.officeTitle.name,
          officeLevel: formatOfficeTitleLevel(assignment.officeTitle.level),
          jurisdiction:
            [
              assignment.department,
              assignment.region,
              assignment.province,
              assignment.cityMunicipality,
              assignment.barangay,
            ]
              .filter(Boolean)
              .join(" · ") || "Not specified",
          startedAt: assignment.startDate,
        })),
    [data],
  );

  const columns = useMemo<ColumnDef<AssignedOfficeHolderRecord>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Member
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
              <p className="text-muted-foreground text-xs">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "officeTitle",
        header: "Office Title",
      },
      {
        accessorKey: "officeLevel",
        header: "Level",
        cell: ({ row }) => <Badge variant="secondary">{row.original.officeLevel}</Badge>,
      },
      {
        accessorKey: "jurisdiction",
        header: "Jurisdiction",
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) =>
          new Date(row.original.startedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
    ],
    [],
  );

  return (
    <GlobalDataTable
      data={rows}
      columns={columns}
      filterPlaceholder="Search member, office title, or jurisdiction..."
      emptyMessage="No active office holders found."
      exportFileName="office-holders"
    />
  );
}

function formatOfficeTitleLevel(level: string) {
  return level
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
