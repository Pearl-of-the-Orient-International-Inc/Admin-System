"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArrowDownUp,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
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
import { useToast } from "@/hooks/use-toast";
import type { OfficeTitleResource } from "@/features/office-title/office-title.types";

type OfficeTitlesDataTableProps = {
  data: OfficeTitleResource[];
  onArchiveOfficeTitle: (id: string) => void;
  onArchiveOfficeTitles: (ids: string[]) => void;
  onRetrieveOfficeTitle: (id: string) => void;
};

export function OfficeTitlesDataTable({
  data,
  onArchiveOfficeTitle,
  onArchiveOfficeTitles,
  onRetrieveOfficeTitle,
}: OfficeTitlesDataTableProps) {
  const { toast } = useToast();

  const columns = useMemo<ColumnDef<OfficeTitleResource>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Office Title
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5 max-w-100">
            <p className="text-sm font-semibold">{row.original.name}</p>
            <p className="text-muted-foreground text-xs line-clamp-1">
              {row.original.description?.trim() || "No description provided."}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {formatOfficeTitleLevel(row.original.level)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "isPublic",
        header: "Website",
        cell: ({ row }) => (
          <Badge variant={row.original.isPublic ? "success" : "secondary"}>
            {row.original.isPublic ? "Published" : "Private"}
          </Badge>
        ),
      },
      {
        accessorKey: "maxSlots",
        header: "Slots",
        cell: ({ row }) =>
          row.original.maxSlots === null ? "Unlimited" : row.original.maxSlots,
      },
      {
        accessorKey: "sections",
        header: "Sections",
        cell: ({ row }) => row.original.sections?.length ?? 0,
      },
      {
        accessorKey: "updatedAt",
        header: "Date Updated",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString("en-US", {
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
      filterPlaceholder="Filter by office title, level, or description..."
      emptyMessage="No office titles found."
      exportFileName="office-titles"
      onDeleteSelected={(selectedRows) =>
        onArchiveOfficeTitles(selectedRows.map((row) => row.id))
      }
      cellAction={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open office title actions</span>
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
                    title: "Office title ID copied",
                    description: `${row.original.id} is now in your clipboard.`,
                  });
                } catch {
                  toast({
                    variant: "error",
                    title: "Copy failed",
                    description: "Unable to copy office title ID to clipboard.",
                  });
                }
              }}
            >
              <Copy className="size-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/organizational-structure/office-title/${row.original.id}`}
              >
                <Edit className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/organizational-structure/office-title/${row.original.id}/view-details`}
              >
                <Eye className="size-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.isActive ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onArchiveOfficeTitle(row.original.id)}
              >
                <Archive className="size-4" />
                Archive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onRetrieveOfficeTitle(row.original.id)}
              >
                <RotateCcw className="size-4" />
                Retrieve
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}

function formatOfficeTitleLevel(level: OfficeTitleResource["level"]) {
  return level
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
