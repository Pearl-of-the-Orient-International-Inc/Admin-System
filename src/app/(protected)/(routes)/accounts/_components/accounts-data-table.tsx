"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Archive,
  ArrowDownUp,
  Copy,
  Edit,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalDataTable } from "@/components/global-data-table";
import { useToast } from "@/hooks/use-toast";
import { UserAccountStatus } from "@/enums";
import type { AccountRecord } from "./accounts-data";
import { formatPositionLabel } from "./accounts-data";

type AccountsDataTableProps = {
  data: AccountRecord[];
  onArchiveAccount: (accountId: string) => void;
  onRetrieveAccount: (accountId: string) => void;
};

export function AccountsDataTable({
  data,
  onArchiveAccount,
  onRetrieveAccount,
}: AccountsDataTableProps) {
  const { toast } = useToast();

  const columns = useMemo<ColumnDef<AccountRecord>[]>(
    () => [
      {
        accessorKey: "fullName",
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
              <AvatarImage src={row.original.avatar || ""} />
              <AvatarFallback>{row.original.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.fullName}</p>
              <p className="text-muted-foreground text-xs">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant={row.original.role === "ADMIN" ? "default" : "secondary"}
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => formatPositionLabel(row.original.position),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          if (row.original.status === UserAccountStatus.ACTIVE) {
            return <Badge variant="success">Active</Badge>;
          }
          if (row.original.status === UserAccountStatus.PENDING) {
            return <Badge variant="warning">Pending</Badge>;
          }
          return <Badge variant="error">Suspended</Badge>;
        },
      },
      {
        accessorKey: "isVerified",
        header: "Email Verified",
        cell: ({ row }) =>
          row.original.isTwoFactorEnabled ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="error">Not Verified</Badge>
          ),
      },
      {
        accessorKey: "lastSignInAt",
        header: "Last Sign In",
        cell: ({ row }) =>
          new Date(row.original.lastSignInAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(row.original.id);
                  toast({
                    variant: "success",
                    title: "Account ID copied",
                    description: `${row.original.id} is now in your clipboard.`,
                  });
                } catch {
                  toast({
                    variant: "error",
                    title: "Copy failed",
                    description: "Unable to copy account ID to clipboard.",
                  });
                }
              }}
            >
              <Copy className="size-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/accounts/${row.original.id}`}>
                <Edit className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/accounts/${row.original.id}/activity`}>
                <Activity className="size-4" />
                Activity
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === UserAccountStatus.SUSPENDED ? (
              <DropdownMenuItem
                onClick={() => onRetrieveAccount(row.original.id)}
              >
                <RotateCcw className="size-4" />
                Retrieve
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onArchiveAccount(row.original.id)}
              >
                <Archive className="size-4" />
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      filterPlaceholder="Search account name, email, position, role, status..."
      emptyMessage="No accounts found."
      exportFileName="accounts"
    />
  );
}
