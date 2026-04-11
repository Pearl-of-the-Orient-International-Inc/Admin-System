"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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
import { GlobalDataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { BranchServiceResource } from "@/features/branch-service/branch-service.types";

type BranchServicesDataTableProps = {
  data: BranchServiceResource[];
  onDeleteBranchService: (id: string) => void;
  onDeleteBranchServices: (ids: string[]) => void;
};

export function BranchServicesDataTable({
  data,
  onDeleteBranchService,
  onDeleteBranchServices,
}: BranchServicesDataTableProps) {
  const { toast } = useToast();

  const columns = useMemo<ColumnDef<BranchServiceResource>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => <p className="font-medium">{row.original.title}</p>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <p className="max-w-xs text-sm leading-relaxed line-clamp-2">
            {row.original.description}
          </p>
        ),
      },
      {
        accessorKey: "sections",
        header: "Sections",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.sections?.length ?? 0} section(s)
          </Badge>
        ),
      },
      {
        accessorKey: "memberCount",
        header: "Members",
        cell: ({ row }) => {
          const memberCount = row.original.memberCount ?? 0;
          return (
            <Badge
              variant={
                memberCount === 0
                  ? "error"
                  : memberCount >= 10
                    ? "success"
                    : "info"
              }
            >
              {memberCount} member{memberCount !== 1 && "s"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Date Updated",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleString("en-US", {
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
      data={data}
      columns={columns}
      cellAction={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open row actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(row.original.id);
                  toast({
                    variant: "success",
                    title: "Branch Service ID copied",
                    description: `${row.original.id} is now in your clipboard.`,
                  });
                } catch {
                  toast({
                    variant: "error",
                    title: "Copy failed",
                    description:
                      "Unable to copy Branch Service ID to clipboard.",
                  });
                }
              }}
            >
              <Copy className="size-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/branch-service/${row.original.id}/view-details`}>
                <Eye className="size-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/branch-service/${row.original.id}`}>
                <Edit className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteBranchService(row.original.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      filterPlaceholder="Search title, description, section count, or date..."
      emptyMessage="No branch services found."
      exportFileName="branch-services"
      onDeleteSelected={(rows) =>
        onDeleteBranchServices(rows.map((row) => row.id))
      }
    />
  );
}
