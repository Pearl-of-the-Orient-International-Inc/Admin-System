"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ArrowDownUp,
  Archive,
  Copy,
  Edit,
  MoreHorizontal,
  RotateCcw,
  UserCog,
} from "lucide-react"

import { GlobalDataTable } from "@/components/DataTable"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { Office } from "./office-data"

type OfficesDataTableProps = {
  data: Office[]
  onDeleteOffices: (officeIds: string[]) => void
  onEditOffice: (officeId: string) => void
  onRequestArchiveOffice: (officeId: string) => void
  onRetrieveOffice: (officeId: string) => void
  onChangeHeadOffice: (officeId: string) => void
}

export function OfficesDataTable({
  data,
  onDeleteOffices,
  onEditOffice,
  onRequestArchiveOffice,
  onRetrieveOffice,
  onChangeHeadOffice,
}: OfficesDataTableProps) {
  const { toast } = useToast()
  const columns = useMemo<ColumnDef<Office>[]>(
    () => [
      {
        accessorKey: "officeTitle",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Office
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>
                {row.original.head
                  .split(" ")
                  .slice(-2)
                  .map((part) => part[0] ?? "")
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">{row.original.head}</p>
              <p className="text-muted-foreground text-xs">{row.original.officeTitle}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "jobDescription",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <p className="text-sm max-w-sm leading-relaxed line-clamp-2">
            {row.original.jobDescription}
          </p>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "Active" ? "success" : "error"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Date Created",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
    ],
    []
  )

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Filter by office title, head, or description..."
      emptyMessage="No offices found."
      exportFileName="organizational-offices"
      onDeleteSelected={(selectedRows) =>
        onDeleteOffices(selectedRows.map((row) => row.id))
      }
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
                  await navigator.clipboard.writeText(row.original.id)
                  toast({
                    variant: "success",
                    title: "Office ID copied",
                    description: `${row.original.id} is now in your clipboard.`,
                  })
                } catch {
                  toast({
                    variant: "error",
                    title: "Copy failed",
                    description: "Unable to copy office ID to clipboard.",
                  })
                }
              }}
            >
              <Copy className="size-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditOffice(row.original.id)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeHeadOffice(row.original.id)}>
              <UserCog className="size-4" />
              Change Head/Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === "Active" ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onRequestArchiveOffice(row.original.id)}
              >
                <Archive className="size-4" />
                Archive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRetrieveOffice(row.original.id)}>
                <RotateCcw className="size-4" />
                Retrieve
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  )
}
