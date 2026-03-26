"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Copy,
  Eye,
  MoreHorizontal,
  Trash2,
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
import type { SystemLogRecord } from "@/features/system-logs/system-log.types";
import {
  formatSystemLogActionType,
  formatSystemLogDate,
  formatSystemLogResult,
} from "@/features/system-logs/system-log.utils";
import { useToast } from "@/hooks/use-toast";

type SystemLogsDataTableProps = {
  data: SystemLogRecord[];
  onViewLog: (log: SystemLogRecord) => void;
  onDeleteLog?: (log: SystemLogRecord) => void;
  isDeleting?: boolean;
};

export function SystemLogsDataTable({
  data,
  onViewLog,
  onDeleteLog,
  isDeleting = false,
}: SystemLogsDataTableProps) {
  const { toast } = useToast();

  const columns = useMemo<ColumnDef<SystemLogRecord>[]>(
    () => [
      {
        accessorKey: "actorName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarImage src={row.original.actorAvatar || ""} />
              <AvatarFallback>{row.original.actorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.actorName}</p>
              <p className="text-muted-foreground text-xs">
                {row.original.actorEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "actionLabel",
        header: "Action",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.actionLabel}</p>
            <p className="text-muted-foreground text-xs">
              {formatSystemLogActionType(row.original.actionType)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "moduleLabel",
        header: "Module",
      },
      {
        accessorKey: "targetLabel",
        header: "Target",
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => (
          <Badge variant={getResultVariant(row.original.result)}>
            {formatSystemLogResult(row.original.result)}
          </Badge>
        ),
      },
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => formatSystemLogDate(row.original.timestamp),
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
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewLog(row.original)}>
              <Eye className="mr-2 size-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(row.original.id);
                  toast({
                    title: "Log ID copied",
                    description: "The activity log ID has been copied.",
                  });
                } catch {
                  toast({
                    title: "Copy failed",
                    description: "Unable to copy the activity log ID.",
                    variant: "error",
                  });
                }
              }}
            >
              <Copy className="mr-2 size-4" />
              Copy ID
            </DropdownMenuItem>
            {onDeleteLog ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteLog(row.original)}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete log
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      filterPlaceholder="Search user, action, module, target, result, or timestamp..."
      emptyMessage="No activity records found."
      exportFileName="system-logs"
    />
  );
}

function getResultVariant(result: SystemLogRecord["result"]) {
  if (result === "SUCCESS") return "success";
  if (result === "WARNING") return "warning";
  return "error";
}
