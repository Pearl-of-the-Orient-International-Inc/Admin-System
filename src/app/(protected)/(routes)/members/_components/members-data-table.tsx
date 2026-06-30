"use client";

import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Download,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  QrCode,
  RotateCcw,
  ShieldMinus,
  Archive,
  Edit,
  ChevronsUpDown,
  LockKeyhole,
  MailCheck,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import { GlobalDataTable } from "@/components/DataTable";
import { MemberType } from "@/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { memberTypeFilterOptions, type MemberRecord } from "./members-data";
import Image from "next/image";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";

type MembersDataTableProps = {
  data: MemberRecord[];
  bulkActionLabel: "Archive" | "Retrieve";
  sorting: SortingState;
  onSortingChange: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  isBatchQrPending?: boolean;
  isBulkActionPending?: boolean;
  isRowArchiveActionPending?: boolean;
  updatingMemberTypeId?: string | null;
  updatingMemberStatusId?: string | null;
  updatingMemberUniqueIdId?: string | null;
  updatingMemberApplicationDateId?: string | null;
  changingMemberPasswordId?: string | null;
  verifyingMemberEmailId?: string | null;
  deletingMemberId?: string | null;
  onBatchDownloadQrCodes: (members: MemberRecord[]) => void;
  onRequestBulkAction: (memberIds: string[]) => void;
  onViewDetails: (member: MemberRecord) => void;
  onEditDetails: (member: MemberRecord) => void;
  onAssignOffice: (member: MemberRecord) => void;
  onRequestToggleMemberArchiveState: (member: MemberRecord) => void;
  onGenerateQrCode: (member: MemberRecord) => void;
  onUpdateMemberUniqueId?: (
    member: MemberRecord,
    uniqueId: string,
  ) => Promise<void>;
  onUpdateMemberType: (
    member: MemberRecord,
    memberType: MemberType,
  ) => Promise<void>;
  onUpdateMemberStatus: (
    member: MemberRecord,
    status: EditableMemberStatus,
  ) => Promise<void>;
  onUpdateMemberApplicationDate?: (
    member: MemberRecord,
    applicationDate: Date,
  ) => Promise<void>;
  onChangeMemberPassword?: (
    member: MemberRecord,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  onVerifyMemberEmail?: (member: MemberRecord) => Promise<void>;
  onDeleteMember?: (member: MemberRecord) => Promise<void>;
};

export function MembersDataTable({
  data,
  bulkActionLabel,
  sorting,
  onSortingChange,
  isBatchQrPending = false,
  isBulkActionPending = false,
  isRowArchiveActionPending = false,
  updatingMemberTypeId = null,
  updatingMemberStatusId = null,
  updatingMemberUniqueIdId = null,
  updatingMemberApplicationDateId = null,
  changingMemberPasswordId = null,
  verifyingMemberEmailId = null,
  deletingMemberId = null,
  onBatchDownloadQrCodes,
  onRequestBulkAction,
  onViewDetails,
  onEditDetails,
  onAssignOffice,
  onRequestToggleMemberArchiveState,
  onGenerateQrCode,
  onUpdateMemberUniqueId,
  onUpdateMemberType,
  onUpdateMemberStatus,
  onUpdateMemberApplicationDate,
  onChangeMemberPassword,
  onVerifyMemberEmail,
  onDeleteMember,
}: MembersDataTableProps) {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUserQuery();

  const [editingMemberTypeId, setEditingMemberTypeId] = useState<string | null>(
    null,
  );
  const [editingMemberUniqueIdId, setEditingMemberUniqueIdId] = useState<
    string | null
  >(null);
  const [editingMemberStatusId, setEditingMemberStatusId] = useState<
    string | null
  >(null);
  const [passwordDialogMember, setPasswordDialogMember] =
    useState<MemberRecord | null>(null);
  const [deleteDialogMember, setDeleteDialogMember] =
    useState<MemberRecord | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const canAccess =
    !isCurrentUserLoading &&
    currentUser?.position === "IT" &&
    currentUser?.role === "ADMIN";
  const canEditMemberUniqueId = canAccess && Boolean(onUpdateMemberUniqueId);
  const canEditMemberApplicationDate = Boolean(onUpdateMemberApplicationDate);
  const canChangeMemberPassword = canAccess && Boolean(onChangeMemberPassword);
  const canVerifyMemberEmail = canAccess && Boolean(onVerifyMemberEmail);
  const canDeleteMember = canAccess && Boolean(onDeleteMember);

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
        cell: ({ row }) => (
          <EditableMemberUniqueIdCell
            member={row.original}
            members={data}
            canAccess={canEditMemberUniqueId}
            isEditing={editingMemberUniqueIdId === row.original.memberId}
            isPending={updatingMemberUniqueIdId === row.original.memberId}
            onStartEditing={() =>
              setEditingMemberUniqueIdId(row.original.memberId)
            }
            onCancelEditing={() => setEditingMemberUniqueIdId(null)}
            onSave={async (uniqueId) => {
              if (!onUpdateMemberUniqueId) return;
              await onUpdateMemberUniqueId(row.original, uniqueId);
              setEditingMemberUniqueIdId(null);
            }}
          />
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
            Full Name
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
              <p className="font-medium uppercase">{row.original.fullName}</p>
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
        cell: ({ row }) => (
          <EditableMemberTypeCell
            member={row.original}
            canAccess={canAccess}
            isEditing={editingMemberTypeId === row.original.memberId}
            isPending={updatingMemberTypeId === row.original.memberId}
            onStartEditing={() => setEditingMemberTypeId(row.original.memberId)}
            onCancelEditing={() => setEditingMemberTypeId(null)}
            onSave={async (memberType) => {
              await onUpdateMemberType(row.original, memberType);
              setEditingMemberTypeId(null);
            }}
          />
        ),
      },
      {
        accessorKey: "isEmailVerified",
        header: "Email Status",
        cell: ({ row }) =>
          row.original.isEmailVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warning">Not verified</Badge>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return (
            <EditableStatusCell
              member={row.original}
              isEditing={editingMemberStatusId === row.original.memberId}
              isPending={updatingMemberStatusId === row.original.memberId}
              onStartEditing={() =>
                setEditingMemberStatusId(row.original.memberId)
              }
              onCancelEditing={() => setEditingMemberStatusId(null)}
              onSave={async (status) => {
                await onUpdateMemberStatus(row.original, status);
                setEditingMemberStatusId(null);
              }}
            />
          );
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Application Date",
        cell: ({ row }) => (
          <EditableApplicationDateCell
            member={row.original}
            canAccess={canEditMemberApplicationDate}
            isPending={
              updatingMemberApplicationDateId === row.original.memberId
            }
            onSave={async (applicationDate) => {
              if (!onUpdateMemberApplicationDate) return;
              await onUpdateMemberApplicationDate(
                row.original,
                applicationDate,
              );
            }}
          />
        ),
      },
    ],
    [
      canAccess,
      canEditMemberApplicationDate,
      canEditMemberUniqueId,
      data,
      editingMemberUniqueIdId,
      editingMemberStatusId,
      editingMemberTypeId,
      onUpdateMemberUniqueId,
      onUpdateMemberApplicationDate,
      onUpdateMemberStatus,
      onUpdateMemberType,
      updatingMemberApplicationDateId,
      updatingMemberUniqueIdId,
      updatingMemberStatusId,
      updatingMemberTypeId,
    ],
  );

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex-col p-6 flex min-h-60 items-center justify-center rounded-xl border border-dashed">
        <Image
          src="/svg-vector/empty-state.svg"
          alt="No data found"
          width={200}
          height={200}
        />
        <div className="space-y-1 text-center mt-10">
          <p className="font-semibold text-lg">No members found.</p>
          <p className="text-muted-foreground">
            Get started by adding a new member manually or importing your data
            via Excel.
          </p>
        </div>
      </div>
    );
  }

  const isPasswordChangePending =
    Boolean(passwordDialogMember) &&
    changingMemberPasswordId === passwordDialogMember?.memberId;
  const isDeletePending =
    Boolean(deleteDialogMember) &&
    deletingMemberId === deleteDialogMember?.memberId;

  const closePasswordDialog = () => {
    if (isPasswordChangePending) return;
    setPasswordDialogMember(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordDialogMember) return;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(null);
    if (!onChangeMemberPassword) return;

    await onChangeMemberPassword(
      passwordDialogMember,
      password,
      confirmPassword,
    );
    closePasswordDialog();
  };

  return (
    <>
      <GlobalDataTable
        data={data}
        columns={columns}
        hideSearch
        hideFooter
        manualSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        filterPlaceholder="Search member name, email, branch, or status..."
        emptyMessage="No members found."
        exportFileName="members"
        renderSelectedActions={(rows, { clearSelection }) => (
          <>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onBatchDownloadQrCodes(rows)}
            disabled={isBatchQrPending || isBulkActionPending}
          >
            {isBatchQrPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {isBatchQrPending ? "Preparing..." : "Download QR Codes"}
          </Button>
          <Button
            variant={bulkActionLabel === "Archive" ? "destructive" : "outline"}
            size="xs"
            onClick={() => {
              onRequestBulkAction(rows.map((row) => row.memberId));
              clearSelection();
            }}
            disabled={isBulkActionPending || isBatchQrPending}
          >
            {isBulkActionPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : bulkActionLabel === "Archive" ? (
              <Archive className="size-3.5" />
            ) : (
              <RotateCcw className="size-3.5" />
            )}
            {isBulkActionPending
              ? bulkActionLabel === "Archive"
                ? "Archiving..."
                : "Retrieving..."
              : bulkActionLabel}
          </Button>
          </>
        )}
        cellAction={(row) => (
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open member actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditDetails(row.original)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            {canChangeMemberPassword && (
              <DropdownMenuItem
                onClick={() => {
                  setPasswordDialogMember(row.original);
                  setPassword("");
                  setConfirmPassword("");
                  setPasswordError(null);
                }}
              >
                <LockKeyhole className="size-4" />
                Change password
              </DropdownMenuItem>
            )}
            {canVerifyMemberEmail && (
              <DropdownMenuItem
                onClick={() => {
                  if (!onVerifyMemberEmail) return;
                  void onVerifyMemberEmail(row.original);
                }}
                disabled={
                  row.original.isEmailVerified ||
                  verifyingMemberEmailId === row.original.memberId
                }
              >
                {verifyingMemberEmailId === row.original.memberId ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <MailCheck className="size-4" />
                )}
                {row.original.isEmailVerified
                  ? "Email verified"
                  : verifyingMemberEmailId === row.original.memberId
                    ? "Verifying..."
                    : "Verify email"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
              <Eye className="size-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAssignOffice(row.original)}
              disabled={row.original.status === "Archived"}
            >
              <BriefcaseBusiness className="size-4" />
              Manage offices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerateQrCode(row.original)}>
              <QrCode className="size-4" />
              Generate QR code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRequestToggleMemberArchiveState(row.original)}
              variant={
                row.original.status === "Archived" ? "default" : "destructive"
              }
              disabled={isRowArchiveActionPending}
            >
              {isRowArchiveActionPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : row.original.status === "Archived" ? (
                <RotateCcw className="size-4" />
              ) : (
                <ShieldMinus className="size-4" />
              )}
              {isRowArchiveActionPending
                ? row.original.status === "Archived"
                  ? "Retrieving..."
                  : "Suspending..."
                : row.original.status === "Archived"
                  ? "Retrieve member"
                  : "Suspend member"}
            </DropdownMenuItem>
            {canDeleteMember && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialogMember(row.original)}
              >
                <Trash2 className="size-4" />
                Delete member
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      />

      <Dialog
        open={Boolean(passwordDialogMember)}
        onOpenChange={(open) => {
          if (!open) closePasswordDialog();
        }}
      >
        <DialogContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Change member password</DialogTitle>
              <DialogDescription>
                Set a new password for {passwordDialogMember?.fullName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="member-password">New password</Label>
                <Input
                  id="member-password"
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
                <Label htmlFor="member-confirm-password">
                  Confirm password
                </Label>
                <Input
                  id="member-confirm-password"
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

      <AlertDialog
        open={Boolean(deleteDialogMember)}
        onOpenChange={(open) => {
          if (!open && !isDeletePending) {
            setDeleteDialogMember(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogMember
                ? `${deleteDialogMember.fullName} and the linked member account will be permanently deleted.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              size="sm"
              disabled={isDeletePending}
              onClick={() => setDeleteDialogMember(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              disabled={isDeletePending}
              onClick={(event) => {
                event.preventDefault();
                if (!deleteDialogMember) return;
                if (!onDeleteMember) return;

                void onDeleteMember(deleteDialogMember).then(() => {
                  setDeleteDialogMember(null);
                });
              }}
            >
              {isDeletePending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type EditableMemberStatus = "Approved" | "Pending" | "Rejected" | "Archived";

function EditableApplicationDateCell({
  member,
  canAccess,
  isPending,
  onSave,
}: {
  member: MemberRecord;
  canAccess: boolean;
  isPending: boolean;
  onSave: (applicationDate: Date) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const appliedAt = new Date(member.appliedAt);
  const selectedDate = Number.isNaN(appliedAt.getTime())
    ? undefined
    : appliedAt;
  const displayValue = selectedDate
    ? format(selectedDate, "MMM d, yyyy")
    : "Not set";

  if (!canAccess) {
    return <span>{displayValue}</span>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-muted"
          onDoubleClick={() => setOpen(true)}
          disabled={isPending}
          title="Double-click to edit application date"
        >
          <span>{displayValue}</span>
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Edit className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          disabled={isPending}
          onSelect={(date) => {
            if (!date) return;
            void onSave(date).then(() => setOpen(false));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function EditableMemberTypeCell({
  member,
  canAccess,
  isEditing,
  isPending,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  member: MemberRecord;
  canAccess: boolean;
  isEditing: boolean;
  isPending: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (memberType: MemberType) => Promise<void>;
}) {
  if (!canAccess) {
    return <span className="truncate max-w-40">{member.memberType}</span>;
  }

  if (isEditing) {
    return (
      <div className="max-w-40 truncate">
        <Select
          open
          value={member.memberTypeValue}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              onCancelEditing();
            }
          }}
          onValueChange={(value) => {
            void onSave(value as MemberType);
          }}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select member type" />
          </SelectTrigger>
          <SelectContent>
            {memberTypeFilterOptions.map((memberType) => (
              <SelectItem key={memberType.value} value={memberType.value}>
                {memberType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-muted"
      onClick={onStartEditing}
      disabled={isPending}
      title="Click to edit member type"
    >
      <span className="truncate max-w-40">{member.memberType}</span>
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

function EditableMemberUniqueIdCell({
  member,
  members,
  canAccess,
  isEditing,
  isPending,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  member: MemberRecord;
  members: MemberRecord[];
  canAccess: boolean;
  isEditing: boolean;
  isPending: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (uniqueId: string) => Promise<void>;
}) {
  const [draftUniqueId, setDraftUniqueId] = useState(member.uniqueId ?? "");
  const [error, setError] = useState<string | null>(null);

  const displayValue = member.uniqueId || "Not set";

  const validate = (value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return "Member ID is required.";
    }

    const duplicate = members.some(
      (item) =>
        item.memberId !== member.memberId &&
        item.uniqueId?.trim().toLowerCase() === normalizedValue.toLowerCase(),
    );

    if (duplicate) {
      return "Member ID already exists.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validate(draftUniqueId);

    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedValue = draftUniqueId.trim();

    if (normalizedValue === member.uniqueId) {
      onCancelEditing();
      return;
    }

    await onSave(normalizedValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSave();
    }

    if (event.key === "Escape") {
      setDraftUniqueId(member.uniqueId ?? "");
      setError(null);
      onCancelEditing();
    }
  };

  if (!canAccess) {
    return <span className="font-medium">{displayValue}</span>;
  }

  if (isEditing) {
    return (
      <div className="w-36 space-y-1">
        <Input
          value={draftUniqueId}
          onChange={(event) => {
            setDraftUniqueId(event.target.value);
            setError(null);
          }}
          onBlur={() => {
            if (!isPending) {
              void handleSave();
            }
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(error)}
          disabled={isPending}
          autoFocus
          className="h-8"
        />
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 font-medium hover:bg-muted"
      onDoubleClick={() => {
        setDraftUniqueId(member.uniqueId ?? "");
        setError(null);
        onStartEditing();
      }}
      disabled={isPending}
      title="Double-click to edit member ID"
    >
      <span>{displayValue}</span>
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Edit className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

function EditableStatusCell({
  member,
  isEditing,
  isPending,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  member: MemberRecord;
  isEditing: boolean;
  isPending: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (status: EditableMemberStatus) => Promise<void>;
}) {
  if (isEditing) {
    return (
      <div className="min-w-40">
        <Select
          open
          value={member.status}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              onCancelEditing();
            }
          }}
          onValueChange={(value) => {
            void onSave(value as EditableMemberStatus);
          }}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MEMBER_STATUS_OPTIONS.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
                disabled={status.value === "Pending"}
              >
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-muted"
      onDoubleClick={() => onStartEditing()}
      disabled={isPending}
      title="Double-click to edit status"
    >
      {renderStatusBadge(member.status)}
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

function renderStatusBadge(status: EditableMemberStatus) {
  if (status === "Approved") {
    return <Badge variant="success">Approved</Badge>;
  }
  if (status === "Pending") {
    return <Badge variant="warning">Pending</Badge>;
  }
  if (status === "Rejected") {
    return <Badge variant="error">Rejected</Badge>;
  }
  return <Badge variant="error">Archived</Badge>;
}

const MEMBER_STATUS_OPTIONS: Array<{
  value: EditableMemberStatus;
  label: string;
}> = [
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
  { value: "Archived", label: "Archived" },
];

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
