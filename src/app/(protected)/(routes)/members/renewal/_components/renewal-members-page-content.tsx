"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import QRCode from "qrcode";
import { subYears } from "date-fns";
import {
  Archive,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchIcon,
  Users,
  X,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { MemberOfficeAssignmentDialog } from "../../_components/member-office-assignment-dialog";
import { MemberDetailsSheet } from "../../_components/member-details-sheet";
import { MemberQrCodeDialog } from "../../_components/member-qr-code-dialog";
import {
  branchOfServiceOptions,
  mapMemberToRecord,
  memberTypeFilterOptions,
  type MemberRecord,
} from "../../_components/members-data";
import { MembersDataTable } from "../../_components/members-data-table";
import {
  useArchiveMemberMutation,
  useMembersQuery,
  useRetrieveMemberMutation,
  useUpdateMemberMutation,
  useUpdateMemberStatusMutation,
} from "@/features/members/member.hooks";
import { useToast } from "@/hooks/use-toast";
import { MemberStatus, MemberType } from "@/enums";
import { mapAdminMemberToUpdatePayload } from "../../_components/member-form-mappers";
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

type MemberArchiveAction = "archive" | "retrieve";

const NO_BRANCHES_FILTER_VALUE = "__no_branches__";

export function RenewalMembersPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("all");
  const [branchOfServiceFilter, setBranchOfServiceFilter] =
    useState<string>("all");
  const [pageSize, setPageSize] = useState(12);
  const [pageIndex, setPageIndex] = useState(0);
  const [tableSorting, setTableSorting] = useState<SortingState>([]);
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
  const [detailsMemberId, setDetailsMemberId] = useState<string | null>(null);
  const [isBatchQrPending, setIsBatchQrPending] = useState(false);
  const [updatingMemberTypeId, setUpdatingMemberTypeId] = useState<
    string | null
  >(null);
  const [updatingMemberStatusId, setUpdatingMemberStatusId] = useState<
    string | null
  >(null);

  const { data, isLoading, isError, error } = useMembersQuery({
    limit: 100,
    includeArchived: true,
  });
  const archiveMemberMutation = useArchiveMemberMutation();
  const retrieveMemberMutation = useRetrieveMemberMutation();
  const updateMemberMutation = useUpdateMemberMutation();
  const updateMemberStatusMutation = useUpdateMemberStatusMutation();

  const renewalThreshold = useMemo(() => subYears(new Date(), 1), []);

  const renewalMembers = useMemo(
    () =>
      (data?.data ?? [])
        .filter(
          (member) =>
            member.isActive &&
            member.status === "APPROVED" &&
            !Number.isNaN(new Date(member.createdAt).getTime()) &&
            new Date(member.createdAt) <= renewalThreshold,
        )
        .map(mapMemberToRecord),
    [data, renewalThreshold],
  );

  const filteredMembers = useMemo(
    () =>
      applyRenewalFilters(
        renewalMembers,
        searchQuery,
        memberTypeFilter,
        branchOfServiceFilter,
      ),
    [branchOfServiceFilter, memberTypeFilter, renewalMembers, searchQuery],
  );

  const visibleMemberTypeOptions = useMemo(
    () =>
      memberTypeFilterOptions.filter((option) =>
        renewalMembers.some((member) => member.memberTypeValue === option.value),
      ),
    [renewalMembers],
  );
  const visibleBranchOfServiceOptions = useMemo(
    () =>
      branchOfServiceOptions.filter((option) =>
        renewalMembers.some((member) =>
          member.branchOfServiceValues.includes(option),
        ),
      ),
    [renewalMembers],
  );
  const hasMembersWithoutBranches = useMemo(
    () =>
      renewalMembers.some((member) => member.branchOfServiceValues.length === 0),
    [renewalMembers],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    memberTypeFilter !== "all" ||
    branchOfServiceFilter !== "all";

  const sortedMembers = useMemo(
    () => sortMembers(filteredMembers, tableSorting),
    [filteredMembers, tableSorting],
  );

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / pageSize));
  const currentPage = Math.min(pageIndex + 1, totalPages);
  const paginatedMembers = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedMembers.slice(start, start + pageSize);
  }, [pageIndex, pageSize, sortedMembers]);

  useEffect(() => {
    setPageIndex((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    setPageIndex(0);
  }, [branchOfServiceFilter, memberTypeFilter, searchQuery, tableSorting]);

  const isArchiveActionPending =
    archiveMemberMutation.isPending || retrieveMemberMutation.isPending;
  const isBlockingActionActive =
    isArchiveActionPending || updateMemberMutation.isPending;
  const blockingActionLabel = archiveMemberMutation.isPending
    ? "Updating member archive state..."
    : updateMemberMutation.isPending
      ? "Saving member details..."
      : "Please wait...";

  const handleViewDetails = (member: MemberRecord) => {
    setDetailsMemberId(member.memberId);
  };

  const handleEditDetails = (member: MemberRecord) => {
    router.push(`/members/${member.memberId}`);
  };

  const handleAssignOffice = (member: MemberRecord) => {
    setOfficeAssignmentMember(member);
  };

  const handleGenerateQrCode = (member: MemberRecord) => {
    setQrDialogMember(member);
  };

  const handleSuspendMember = (member: MemberRecord) => {
    setPendingMemberAction({
      type: member.status === "Archived" ? "retrieve" : "archive",
      memberIds: [member.memberId],
      memberNames: [member.fullName],
    });
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
        link.download = `${buildQrFileBaseName(
          member.lastName,
          member.firstName,
          member.uniqueId ?? member.id,
        )}.png`;
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 150));
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
        description: "Unable to generate one or more selected QR codes right now.",
      });
    } finally {
      setIsBatchQrPending(false);
    }
  };

  const handleArchiveMembers = async (memberIds: string[]) => {
    try {
      await Promise.all(
        memberIds.map((memberId) => archiveMemberMutation.mutateAsync(memberId)),
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

  const handleConfirmPendingMemberAction = async () => {
    if (!pendingMemberAction) return;

    if (pendingMemberAction.type === "archive") {
      await handleArchiveMembers(pendingMemberAction.memberIds);
    }

    setPendingMemberAction(null);
  };

  const handleUpdateMemberType = async (
    member: MemberRecord,
    memberType: MemberType,
  ) => {
    const sourceMember = data?.data.find((item) => item.id === member.memberId);

    if (!sourceMember) {
      toast({
        variant: "error",
        title: "Update failed",
        description: "The selected member record could not be found.",
      });
      return;
    }

    if (sourceMember.memberType === memberType) {
      return;
    }

    try {
      setUpdatingMemberTypeId(member.memberId);
      await updateMemberMutation.mutateAsync({
        memberId: member.memberId,
        payload: {
          ...mapAdminMemberToUpdatePayload(sourceMember),
          memberType,
        },
      });
      toast({
        variant: "success",
        title: "Member type updated",
        description: `${member.fullName} is now set to ${formatMemberTypeLabel(memberType)}.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Update failed",
        description: "Unable to update the member type right now.",
      });
      throw new Error("Unable to update member type.");
    } finally {
      setUpdatingMemberTypeId(null);
    }
  };

  const handleUpdateMemberStatus = async (
    member: MemberRecord,
    status: "Approved" | "Pending" | "Rejected" | "Archived",
  ) => {
    if (status === "Pending") {
      toast({
        variant: "warning",
        title: "Pending is unavailable",
        description:
          "There is no admin action available to move a member back to pending.",
      });
      return;
    }

    try {
      setUpdatingMemberStatusId(member.memberId);

      if (status === "Archived") {
        await archiveMemberMutation.mutateAsync(member.memberId);
      } else {
        await updateMemberStatusMutation.mutateAsync({
          memberId: member.memberId,
          status:
            status === "Approved"
              ? MemberStatus.APPROVED
              : MemberStatus.REJECTED,
        });
      }

      toast({
        variant: "success",
        title: "Member status updated",
        description: `${member.fullName} is now ${status.toLowerCase()}.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Update failed",
        description: "Unable to update the member status right now.",
      });
      throw new Error("Unable to update member status.");
    } finally {
      setUpdatingMemberStatusId(null);
    }
  };

  if (isLoading) {
    return <PageLoadingState mode="table" />;
  }

  if (isError) {
    return (
      <PageErrorState
        title="Unable to load renewal members"
        description={
          error instanceof Error
            ? error.message
            : "Renewal members could not be loaded right now."
        }
        backUrl="/members"
        backLabel="Back to members"
      />
    );
  }

  return (
    <>
      <section className="space-y-6 p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Renewal Members
            </h1>
            <p className="text-muted-foreground text-sm">
              Members whose application date has reached the yearly renewal window.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden bg-transparent">
          <CardHeader className="border-b pb-4">
            <CardTitle>Renewal Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-5 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Renewal Due
                  </p>
                  <CalendarClock className="size-4 text-amber-600" />
                </div>
                <p className="text-2xl font-semibold">{renewalMembers.length}</p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Filtered Results
                  </p>
                  <Users className="size-4 text-blue-600" />
                </div>
                <p className="text-2xl font-semibold">{filteredMembers.length}</p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Renewal Rule
                  </p>
                  <Archive className="size-4 text-emerald-600" />
                </div>
                <p className="text-sm font-medium">
                  Applied on or before {renewalThreshold.toLocaleDateString("en-US")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-5 md:flex-row md:items-center md:justify-between">
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                  <SearchIcon className="size-4" />
                  <span className="sr-only">Search</span>
                </div>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search member name, email, branch, or status..."
                  className="lg:w-100 px-9"
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue placeholder="Filter by member type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {visibleMemberTypeOptions.map((memberType) => (
                      <SelectItem key={memberType.value} value={memberType.value}>
                        {memberType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={branchOfServiceFilter}
                  onValueChange={setBranchOfServiceFilter}
                >
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue placeholder="Filter by branch of service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {hasMembersWithoutBranches ? (
                      <SelectItem value={NO_BRANCHES_FILTER_VALUE}>
                        No branches
                      </SelectItem>
                    ) : null}
                    {visibleBranchOfServiceOptions.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setMemberTypeFilter("all");
                      setBranchOfServiceFilter("all");
                    }}
                  >
                    <X className="size-4" />
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </div>

            {!renewalMembers.length ? (
              <PageEmptyState
                title="No renewal members yet"
                description="There are no active approved members whose application date has reached one year yet."
                createUrl="/members"
                createLabel="Back to members"
              />
            ) : (
              <>
                <MembersDataTable
                  data={paginatedMembers}
                  bulkActionLabel="Archive"
                  sorting={tableSorting}
                  onSortingChange={setTableSorting}
                  updatingMemberTypeId={updatingMemberTypeId}
                  updatingMemberStatusId={updatingMemberStatusId}
                  isBatchQrPending={isBatchQrPending}
                  isBulkActionPending={isArchiveActionPending}
                  isRowArchiveActionPending={isArchiveActionPending}
                  onBatchDownloadQrCodes={handleBatchDownloadQrCodes}
                  onRequestBulkAction={(memberIds) =>
                    setPendingMemberAction({
                      type: "archive",
                      memberIds,
                      memberNames: [],
                    })
                  }
                  onViewDetails={handleViewDetails}
                  onEditDetails={handleEditDetails}
                  onAssignOffice={handleAssignOffice}
                  onRequestToggleMemberArchiveState={handleSuspendMember}
                  onGenerateQrCode={handleGenerateQrCode}
                  onUpdateMemberType={handleUpdateMemberType}
                  onUpdateMemberStatus={handleUpdateMemberStatus}
                />

                <div className="flex flex-col gap-3 mt-5 px-1 md:flex-row md:items-center md:justify-between">
                  <div className="text-muted-foreground flex-1 text-sm">
                    Showing {sortedMembers.length === 0 ? 0 : pageIndex * pageSize + 1}-
                    {Math.min((pageIndex + 1) * pageSize, sortedMembers.length)} of{" "}
                    {sortedMembers.length} renewal member(s).
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setPageIndex(0);
                        }}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[12, 24, 36, 48].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex w-27.5 items-center justify-center text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="hidden lg:flex"
                        onClick={() => setPageIndex(0)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronsLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          setPageIndex((value) => Math.min(totalPages - 1, value + 1))
                        }
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="hidden lg:flex"
                        onClick={() => setPageIndex(totalPages - 1)}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronsRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
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

      <MemberDetailsSheet
        memberId={detailsMemberId}
        open={Boolean(detailsMemberId)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsMemberId(null);
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
            <AlertDialogTitle>Archive selected renewal members?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMemberAction
                ? pendingMemberAction.memberIds.length === 1
                  ? `${pendingMemberAction.memberNames[0] ?? "The selected member"} will be archived.`
                  : `${pendingMemberAction.memberIds.length} selected members will be archived.`
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
                  Archiving...
                </>
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
              <p className="text-muted-foreground text-sm">{blockingActionLabel}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function applyRenewalFilters(
  members: MemberRecord[],
  searchQuery: string,
  memberTypeFilter: string,
  branchOfServiceFilter: string,
) {
  return members.filter((member) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (normalizedSearch) {
      const matchesSearch = [
        member.uniqueId,
        member.fullName,
        member.memberType,
        member.email,
        member.mobile,
        member.civilStatus,
        member.branchOfService,
        member.status,
        member.badgeNumber,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch),
      );

      if (!matchesSearch) {
        return false;
      }
    }

    if (
      memberTypeFilter !== "all" &&
      member.memberTypeValue !== memberTypeFilter
    ) {
      return false;
    }

    if (
      branchOfServiceFilter !== "all" &&
      (branchOfServiceFilter === NO_BRANCHES_FILTER_VALUE
        ? member.branchOfServiceValues.length > 0
        : !member.branchOfServiceValues.includes(branchOfServiceFilter))
    ) {
      return false;
    }

    return true;
  });
}

function formatMemberTypeLabel(memberType: MemberType) {
  switch (memberType) {
    case MemberType.PROFESSIONAL_CHAPLAIN:
      return "Professional Chaplain";
    case MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER:
      return "Ordained and Commissioned Practitioner";
    case MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR:
      return "Certified Specialist Training Officer/Instructor";
    case MemberType.ASSOCIATE_CHAPLAIN:
    default:
      return "Associate Chaplain";
  }
}

function sortMembers(members: MemberRecord[], sorting: SortingState) {
  if (!sorting.length) {
    return members;
  }

  const [{ id, desc }] = sorting;
  const direction = desc ? -1 : 1;

  return [...members].sort((left, right) => {
    let comparison = 0;

    switch (id) {
      case "uniqueId":
        comparison = compareMemberUniqueId(left.uniqueId, right.uniqueId);
        break;
      case "fullName":
        comparison = left.fullName.localeCompare(right.fullName, undefined, {
          sensitivity: "base",
        });
        break;
      case "memberType":
        comparison = left.memberType.localeCompare(right.memberType, undefined, {
          sensitivity: "base",
        });
        break;
      case "status":
        comparison = left.status.localeCompare(right.status, undefined, {
          sensitivity: "base",
        });
        break;
      case "branchOfService":
        comparison = left.branchOfService.localeCompare(
          right.branchOfService,
          undefined,
          { sensitivity: "base" },
        );
        break;
      case "appliedAt":
        comparison =
          new Date(left.appliedAt).getTime() -
          new Date(right.appliedAt).getTime();
        break;
      default:
        comparison = 0;
        break;
    }

    if (comparison !== 0) {
      return comparison * direction;
    }

    return compareMemberUniqueId(left.uniqueId, right.uniqueId) * direction;
  });
}

function compareNatural(left: string, right: string) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function compareMemberUniqueId(
  leftUniqueId: string | null,
  rightUniqueId: string | null,
) {
  const leftParsed = parseMemberUniqueId(leftUniqueId);
  const rightParsed = parseMemberUniqueId(rightUniqueId);

  if (!leftParsed && !rightParsed) return 0;
  if (!leftParsed) return 1;
  if (!rightParsed) return -1;

  const prefixComparison =
    getUniqueIdPrefixRank(leftParsed.prefix) -
    getUniqueIdPrefixRank(rightParsed.prefix);

  if (prefixComparison !== 0) {
    return prefixComparison;
  }

  const seriesComparison = leftParsed.series - rightParsed.series;

  if (seriesComparison !== 0) {
    return seriesComparison;
  }

  return compareNatural(leftParsed.raw, rightParsed.raw);
}

function parseMemberUniqueId(uniqueId: string | null) {
  if (!uniqueId) {
    return null;
  }

  const match = uniqueId.match(/^(\d{3})-(\d{5})$/);

  if (!match) {
    return {
      raw: uniqueId,
      prefix: uniqueId,
      series: Number.MAX_SAFE_INTEGER,
    };
  }

  return {
    raw: uniqueId,
    prefix: match[1],
    series: Number.parseInt(match[2], 10),
  };
}

function getUniqueIdPrefixRank(prefix: string) {
  if (prefix === "262") return 0;
  if (prefix === "261") return 1;
  return Number.parseInt(prefix, 10) || Number.MAX_SAFE_INTEGER;
}

function buildQrFileBaseName(
  lastName: string,
  firstName: string,
  idNumber: string,
) {
  return [
    sanitizeFileNameSegment(lastName),
    sanitizeFileNameSegment(firstName),
    sanitizeFileNameSegment(idNumber),
  ]
    .filter(Boolean)
    .join("-");
}

function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
