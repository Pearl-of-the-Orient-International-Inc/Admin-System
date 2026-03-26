"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  LayoutGrid,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  QrCode,
  RotateCcw,
  Rows3,
  ShieldAlert,
  ShieldMinus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ImportMembersButton } from "./import-members-button";
import { MemberOfficeAssignmentDialog } from "./member-office-assignment-dialog";
import { MemberQrCodeDialog } from "./member-qr-code-dialog";
import { mapMemberToRecord, type MemberRecord } from "./members-data";
import { MembersDataTable } from "./members-data-table";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { Button } from "@/components/ui/button";
import {
  useArchiveMemberMutation,
  useMembersQuery,
  useRetrieveMemberMutation,
} from "@/features/members/member.hooks";
import { useToast } from "@/hooks/use-toast";

type MembersViewMode = "grid" | "table";
type StatusTabValue = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
type MemberArchiveAction = "archive" | "retrieve";

export function MembersPageContent() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<MembersViewMode>("grid");
  const [statusTab, setStatusTab] = useState<StatusTabValue>("ALL");
  const [pendingMemberAction, setPendingMemberAction] = useState<{
    type: MemberArchiveAction;
    memberIds: string[];
    memberNames: string[];
  } | null>(null);
  const [officeAssignmentMember, setOfficeAssignmentMember] =
    useState<MemberRecord | null>(null);
  const [qrDialogMember, setQrDialogMember] = useState<MemberRecord | null>(
    null,
  );
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useMembersQuery({
    limit: 100,
    includeArchived: true,
  });
  const archiveMemberMutation = useArchiveMemberMutation();
  const retrieveMemberMutation = useRetrieveMemberMutation();
  const [isBatchQrPending, setIsBatchQrPending] = useState(false);

  const members = useMemo(
    () => data?.data.map(mapMemberToRecord) ?? [],
    [data],
  );

  const totalMembers = members.length;
  const hasNoMembers = !isLoading && !isError && members.length === 0;
  const approvedMembers = useMemo(
    () => members.filter((member) => member.status === "Approved").length,
    [members],
  );
  const pendingMembers = useMemo(
    () => members.filter((member) => member.status === "Pending").length,
    [members],
  );
  const archivedMembers = useMemo(
    () => members.filter((member) => member.status === "Archived").length,
    [members],
  );
  const rejectedMembers = useMemo(
    () => members.filter((member) => member.status === "Rejected").length,
    [members],
  );
  const filteredMembers = useMemo(() => {
    if (statusTab === "ALL") {
      return members;
    }

    const statusByTab: Record<
      Exclude<StatusTabValue, "ALL">,
      MemberRecord["status"]
    > = {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      ARCHIVED: "Archived",
    };

    return members.filter((member) => member.status === statusByTab[statusTab]);
  }, [members, statusTab]);

  const handleArchiveMembers = async (memberIds: string[]) => {
    try {
      await Promise.all(
        memberIds.map((memberId) =>
          archiveMemberMutation.mutateAsync(memberId),
        ),
      );
      toast({
        variant: "success",
        title: "Members archived",
        description:
          memberIds.length === 1
            ? "The selected member has been archived."
            : `${memberIds.length} members have been archived.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Archive failed",
        description: "One or more selected members could not be archived.",
      });
    }
  };

  const handleRetrieveMembers = async (memberIds: string[]) => {
    try {
      await Promise.all(
        memberIds.map((memberId) =>
          retrieveMemberMutation.mutateAsync(memberId),
        ),
      );
      toast({
        variant: "success",
        title: "Members retrieved",
        description:
          memberIds.length === 1
            ? "The selected member has been restored."
            : `${memberIds.length} members have been restored.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Retrieve failed",
        description: "One or more selected members could not be restored.",
      });
    }
  };

  const handleBatchDownloadQrCodes = async (
    selectedMembers: MemberRecord[],
  ) => {
    const membersWithUniqueId = selectedMembers.filter(
      (member) => member.uniqueId,
    );

    if (membersWithUniqueId.length === 0) {
      toast({
        variant: "warning",
        title: "No QR codes available",
        description: "Selected members do not have public unique IDs yet.",
      });
      return;
    }

    try {
      setIsBatchQrPending(true);
      for (const member of membersWithUniqueId) {
        const profileUrl = `https://pearlchaplaincy.org/profile/${encodeURIComponent(
          member.uniqueId!,
        )}`;
        const qrDataUrl = await QRCode.toDataURL(profileUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: "#111",
            light: "#ffffff",
          },
        });

        const link = document.createElement("a");
        link.href = qrDataUrl;
        link.download = `${member.id}.png`;
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 150));
      }

      if (membersWithUniqueId.length < selectedMembers.length) {
        toast({
          variant: "warning",
          title: "Partial QR download complete",
          description: `${membersWithUniqueId.length} QR code(s) downloaded. Some selected members were skipped because they do not have public unique IDs yet.`,
        });
        return;
      }

      toast({
        variant: "success",
        title: "QR download started",
        description: `${membersWithUniqueId.length} member QR code(s) are downloading.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "QR download failed",
        description:
          "Unable to generate one or more selected QR codes right now.",
      });
    } finally {
      setIsBatchQrPending(false);
    }
  };

  const handleViewDetails = (member: MemberRecord) => {
    if (!member.uniqueId) {
      toast({
        variant: "warning",
        title: "Profile unavailable",
        description: `${member.fullName} does not have a public unique ID yet.`,
      });
      return;
    }

    window.open(
      `https://pearlchaplaincy.org/profile/${encodeURIComponent(member.uniqueId)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleEditDetails = (member: MemberRecord) => {
    router.push(`/members/${member.memberId}`);
  };

  const handleAssignOffice = (member: MemberRecord) => {
    setOfficeAssignmentMember(member);
  };

  const handleSuspendMember = async (member: MemberRecord) => {
    setPendingMemberAction({
      type: member.status === "Archived" ? "retrieve" : "archive",
      memberIds: [member.memberId],
      memberNames: [member.fullName],
    });
  };

  const handleGenerateQrCode = (member: MemberRecord) => {
    setQrDialogMember(member);
  };

  const handleRequestBulkMemberAction = (memberIds: string[]) => {
    const selectedMembers = members.filter((member) =>
      memberIds.includes(member.memberId),
    );
    setPendingMemberAction({
      type: statusTab === "ARCHIVED" ? "retrieve" : "archive",
      memberIds,
      memberNames: selectedMembers.map((member) => member.fullName),
    });
  };

  const handleConfirmPendingMemberAction = async () => {
    if (!pendingMemberAction) return;

    if (pendingMemberAction.type === "archive") {
      await handleArchiveMembers(pendingMemberAction.memberIds);
    } else {
      await handleRetrieveMembers(pendingMemberAction.memberIds);
    }

    setPendingMemberAction(null);
  };

  const isArchiveActionPending =
    archiveMemberMutation.isPending || retrieveMemberMutation.isPending;
  const blockingActionLabel = isBatchQrPending
    ? "Preparing QR code downloads..."
    : archiveMemberMutation.isPending
      ? "Archiving member records..."
      : retrieveMemberMutation.isPending
        ? "Retrieving member records..."
        : "";
  const isBlockingActionActive = Boolean(blockingActionLabel);

  return (
    <>
      <section className="space-y-6 p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
            <p className="text-muted-foreground text-sm">
              Manage member records and membership status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportMembersButton />
            {!hasNoMembers && (
              <Button asChild>
                <Link href="/members/new">
                  <Plus className="size-4" />
                  Add new member
                </Link>
              </Button>
            )}
          </div>
        </div>

        {hasNoMembers ? (
          <PageEmptyState
            title="No members found"
            description="Get started by adding a new member manually or importing your data via Excel."
            createUrl="/members/new"
            createLabel="Add new member"
          />
        ) : (
          <>
            <Card className="overflow-hidden bg-transparent">
              <CardHeader className="border-b pb-4">
                <CardTitle>Member Summary</CardTitle>
                <CardDescription>
                  Snapshot of current membership processing status.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Total Members
                    </p>
                    <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                      <Users className="size-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-semibold">{totalMembers}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    All recorded member profiles
                  </p>
                </div>

                <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Approved
                    </p>
                    <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-semibold">{approvedMembers}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Fully endorsed members
                  </p>
                </div>

                <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Pending
                    </p>
                    <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                      <Clock3 className="size-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-semibold">{pendingMembers}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Awaiting review and validation
                  </p>
                </div>

                <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Archived
                    </p>
                    <span className="rounded-md bg-red-700/10 p-1.5 text-red-700 dark:bg-red-300/10 dark:text-red-300">
                      <ShieldAlert className="size-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-semibold">{archivedMembers}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Archived profiles, with {rejectedMembers} rejected
                    applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-transparent">
              <CardHeader className="border-b">
                <div className="flex gap-4 items-center w-full justify-between">
                  <Tabs
                    value={statusTab}
                    onValueChange={(value) =>
                      setStatusTab(value as StatusTabValue)
                    }
                  >
                    <TabsList variant="line">
                      <TabsTrigger value="ALL">
                        All ({totalMembers})
                      </TabsTrigger>
                      <TabsTrigger value="PENDING">
                        Pending ({pendingMembers})
                      </TabsTrigger>
                      <TabsTrigger value="APPROVED">
                        Approved ({approvedMembers})
                      </TabsTrigger>
                      <TabsTrigger value="REJECTED">
                        Rejected ({rejectedMembers})
                      </TabsTrigger>
                      <TabsTrigger value="ARCHIVED">
                        Archived ({archivedMembers})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value === "grid" || value === "table") {
                        setViewMode(value);
                      }
                    }}
                    aria-label="Toggle members view"
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                      <LayoutGrid className="size-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Table view">
                      <Rows3 className="size-4" />
                      <span className="hidden sm:inline">Table</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <PageLoadingState
                    mode={viewMode === "grid" ? "grid" : "table"}
                  />
                ) : isError ? (
                  <PageErrorState
                    title="Unable to load members"
                    description={
                      error instanceof Error
                        ? error.message
                        : "Member records could not be loaded right now."
                    }
                    backUrl="/dashboard"
                    backLabel="Back to dashboard"
                  />
                ) : viewMode === "grid" ? (
                  <MembersGridView
                    data={filteredMembers}
                    isArchiveActionPending={isArchiveActionPending}
                    onViewDetails={handleViewDetails}
                    onEditDetails={handleEditDetails}
                    onAssignOffice={handleAssignOffice}
                    onRequestToggleMemberArchiveState={handleSuspendMember}
                    onGenerateQrCode={handleGenerateQrCode}
                  />
                ) : (
                  <MembersDataTable
                    data={filteredMembers}
                    bulkActionLabel={
                      statusTab === "ARCHIVED" ? "Retrieve" : "Archive"
                    }
                    isBatchQrPending={isBatchQrPending}
                    isBulkActionPending={isArchiveActionPending}
                    isRowArchiveActionPending={isArchiveActionPending}
                    onBatchDownloadQrCodes={handleBatchDownloadQrCodes}
                    onRequestBulkAction={handleRequestBulkMemberAction}
                    onViewDetails={handleViewDetails}
                    onEditDetails={handleEditDetails}
                    onAssignOffice={handleAssignOffice}
                    onRequestToggleMemberArchiveState={handleSuspendMember}
                    onGenerateQrCode={handleGenerateQrCode}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <MemberOfficeAssignmentDialog
        member={officeAssignmentMember}
        open={Boolean(officeAssignmentMember)}
        onOpenChange={(open) => {
          if (!open) {
            setOfficeAssignmentMember(null);
          }
        }}
      />

      <MemberQrCodeDialog
        member={qrDialogMember}
        open={Boolean(qrDialogMember)}
        onOpenChange={(open) => {
          if (!open) {
            setQrDialogMember(null);
          }
        }}
      />

      <AlertDialog
        open={Boolean(pendingMemberAction)}
        onOpenChange={(open) => {
          if (!open && !isArchiveActionPending) {
            setPendingMemberAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingMemberAction?.type === "retrieve"
                ? "Retrieve selected member records?"
                : "Archive selected member records?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMemberAction
                ? pendingMemberAction.memberIds.length === 1
                  ? pendingMemberAction.type === "retrieve"
                    ? `${pendingMemberAction.memberNames[0]} will be restored to the active member list.`
                    : `${pendingMemberAction.memberNames[0]} will be archived and hidden from the active member list.`
                  : pendingMemberAction.type === "retrieve"
                    ? `${pendingMemberAction.memberIds.length} selected members will be restored to the active member list.`
                    : `${pendingMemberAction.memberIds.length} selected members will be archived and hidden from the active member list.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMemberAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmPendingMemberAction()}
              disabled={isArchiveActionPending}
            >
              {isArchiveActionPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {pendingMemberAction?.type === "retrieve"
                    ? "Retrieving..."
                    : "Archiving..."}
                </>
              ) : pendingMemberAction?.type === "retrieve" ? (
                "Retrieve"
              ) : (
                "Archive"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isBlockingActionActive ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex min-w-lg items-center gap-3 rounded-xl border bg-card px-6 py-5 shadow-xl">
            <LoaderCircle className="text-primary size-10 animate-spin" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Please wait</p>
              <p className="text-muted-foreground text-sm">
                {blockingActionLabel}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MembersGridView({
  data,
  isArchiveActionPending,
  onViewDetails,
  onEditDetails,
  onAssignOffice,
  onRequestToggleMemberArchiveState,
  onGenerateQrCode,
}: {
  data: MemberRecord[];
  isArchiveActionPending: boolean;
  onViewDetails: (member: MemberRecord) => void;
  onEditDetails: (member: MemberRecord) => void;
  onAssignOffice: (member: MemberRecord) => void;
  onRequestToggleMemberArchiveState: (member: MemberRecord) => void;
  onGenerateQrCode: (member: MemberRecord) => void;
}) {
  if (!data.length) {
    return (
      <PageEmptyState
        title="No members found"
        description="Get started by adding a new member manually or importing your data via Excel."
        createUrl="/members/new"
        createLabel="Add new member"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((member) => (
        <Card
          key={member.id}
          className="overflow-hidden border-border/70 bg-card py-0 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative overflow-hidden p-0!">
            <div className="absolute right-4 top-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="bg-background/85 backdrop-blur"
                    aria-label="Open member actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-48"
                >
                  <DropdownMenuItem onClick={() => onViewDetails(member)}>
                    <Eye className="size-4" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditDetails(member)}>
                    <Edit3 className="size-4" />
                    Edit details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onAssignOffice(member)}
                    disabled={member.status === "Archived"}
                  >
                    <BriefcaseBusiness className="size-4" />
                    Manage offices
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRequestToggleMemberArchiveState(member)}
                    variant={
                      member.status === "Archived" ? "default" : "destructive"
                    }
                    disabled={isArchiveActionPending}
                  >
                    {isArchiveActionPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : member.status === "Archived" ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <ShieldMinus className="size-4" />
                    )}
                    {isArchiveActionPending
                      ? member.status === "Archived"
                        ? "Retrieving..."
                        : "Suspending..."
                      : member.status === "Archived"
                        ? "Retrieve member"
                        : "Suspend member"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onGenerateQrCode(member)}>
                    <QrCode className="size-4" />
                    Generate QR code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative flex h-85 w-full">
              <Avatar className="size-full rounded-none!">
                {member.avatarUrl ? (
                  <AvatarImage
                    src={member.avatarUrl}
                    alt={member.fullName}
                    className="object-cover object-top"
                  />
                ) : null}
                <AvatarFallback className="text-4xl font-semibold rounded-none text-white bg-accent">
                  {getMemberInitials(member.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="space-y-4 px-6 py-5 pt-0!">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">
                {member.fullName}
              </h3>
              <p className="text-muted-foreground text-sm">
                {member.memberType}
              </p>
            </div>

            {/* <div className="grid gap-3 text-sm sm:grid-cols-2">
              <MemberMeta
                label="Status"
                value={member.status}
                tone={member.status}
              />
              <MemberMeta label="Civil Status" value={member.civilStatus} />
              <MemberMeta label="Mobile" value={member.mobile} />
              <MemberMeta
                label="Applied"
                value={formatAppliedDate(member.appliedAt)}
              />
            </div>

            <div className="border-border/70 text-muted-foreground border-t pt-4 text-sm">
              {member.email}
            </div> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
