"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Archive,
  ArrowDownUp,
  BadgeCheck,
  Copy,
  Edit,
  LoaderCircle,
  LockKeyhole,
  MailCheck,
  MoreHorizontal,
  RotateCcw,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalDataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { UserAccountStatus } from "@/enums";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountRecord } from "./accounts-data";
import { formatPositionLabel } from "./accounts-data";

type AccountsDataTableProps = {
  data: AccountRecord[];
  changingPasswordAccountId?: string | null;
  resendingVerificationAccountId?: string | null;
  verifyingEmailAccountId?: string | null;
  onArchiveAccount: (accountId: string) => void;
  onRetrieveAccount: (accountId: string) => void;
  onChangeAccountPassword?: (
    account: AccountRecord,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  onResendAccountEmailVerification?: (
    account: AccountRecord,
  ) => Promise<void>;
  onVerifyAccountEmail?: (account: AccountRecord) => Promise<void>;
};

export function AccountsDataTable({
  data,
  changingPasswordAccountId = null,
  resendingVerificationAccountId = null,
  verifyingEmailAccountId = null,
  onArchiveAccount,
  onRetrieveAccount,
  onChangeAccountPassword,
  onResendAccountEmailVerification,
  onVerifyAccountEmail,
}: AccountsDataTableProps) {
  const { toast } = useToast();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUserQuery();
  const [passwordDialogAccount, setPasswordDialogAccount] =
    useState<AccountRecord | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const canUseItActions =
    !isCurrentUserLoading &&
    currentUser?.role === "ADMIN" &&
    currentUser?.position === "IT";
  const canChangePassword =
    canUseItActions && Boolean(onChangeAccountPassword);
  const canResendVerification =
    canUseItActions && Boolean(onResendAccountEmailVerification);
  const canVerifyEmail = canUseItActions && Boolean(onVerifyAccountEmail);
  const isPasswordChangePending =
    Boolean(passwordDialogAccount) &&
    changingPasswordAccountId === passwordDialogAccount?.id;

  const closePasswordDialog = () => {
    if (isPasswordChangePending) return;
    setPasswordDialogAccount(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordDialogAccount || !onChangeAccountPassword) return;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(null);
    try {
      await onChangeAccountPassword(
        passwordDialogAccount,
        password,
        confirmPassword,
      );
      closePasswordDialog();
    } catch {
      // Parent handler owns toast/error messaging.
    }
  };

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
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => formatPositionLabel(row.original.position),
      },
      {
        accessorKey: "isTwoFactorEnabled",
        header: "Two Factor Auth",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isTwoFactorEnabled ? "success" : "error"}
          >
            {row.original.isTwoFactorEnabled ? "Enabled" : "Disabled"}
          </Badge>
        ),
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
        accessorKey: "isEmailVerified",
        header: "Email Verified",
        cell: ({ row }) =>
          row.original.isEmailVerified ? (
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
    <>
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
            {canChangePassword ? (
              <DropdownMenuItem
                onClick={() => {
                  setPasswordDialogAccount(row.original);
                  setPassword("");
                  setConfirmPassword("");
                  setPasswordError(null);
                }}
              >
                <LockKeyhole className="size-4" />
                Change password
              </DropdownMenuItem>
            ) : null}
            {canResendVerification ? (
              <DropdownMenuItem
                onClick={() => {
                  if (!onResendAccountEmailVerification) return;
                  void onResendAccountEmailVerification(row.original);
                }}
                disabled={
                  row.original.isEmailVerified ||
                  resendingVerificationAccountId === row.original.id
                }
              >
                {resendingVerificationAccountId === row.original.id ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <MailCheck className="size-4" />
                )}
                {row.original.isEmailVerified
                  ? "Email verified"
                  : resendingVerificationAccountId === row.original.id
                    ? "Sending..."
                    : "Resend verification"}
              </DropdownMenuItem>
            ) : null}
            {canVerifyEmail ? (
              <DropdownMenuItem
                onClick={() => {
                  if (!onVerifyAccountEmail) return;
                  void onVerifyAccountEmail(row.original);
                }}
                disabled={
                  row.original.isEmailVerified ||
                  verifyingEmailAccountId === row.original.id
                }
              >
                {verifyingEmailAccountId === row.original.id ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <BadgeCheck className="size-4" />
                )}
                {row.original.isEmailVerified
                  ? "Email verified"
                  : verifyingEmailAccountId === row.original.id
                    ? "Verifying..."
                    : "Verify email"}
              </DropdownMenuItem>
            ) : null}
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

      <Dialog
        open={Boolean(passwordDialogAccount)}
        onOpenChange={(open) => {
          if (!open) closePasswordDialog();
        }}
      >
        <DialogContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Change account password</DialogTitle>
              <DialogDescription>
                Set a new password for {passwordDialogAccount?.fullName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="account-password">New password</Label>
                <Input
                  id="account-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isPasswordChangePending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="account-confirm-password">
                  Confirm password
                </Label>
                <Input
                  id="account-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordError)}
                  disabled={isPasswordChangePending}
                  required
                />
                {passwordError ? (
                  <p className="text-destructive text-sm">{passwordError}</p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closePasswordDialog}
                disabled={isPasswordChangePending}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPasswordChangePending}>
                {isPasswordChangePending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
