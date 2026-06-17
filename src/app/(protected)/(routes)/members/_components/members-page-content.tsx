"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import QRCode from "qrcode";
import type { DateRange } from "react-day-picker";
import { endOfDay, format, isAfter, isBefore, startOfDay } from "date-fns";
import {
  BriefcaseBusiness,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  SearchIcon,
  ShieldAlert,
  ShieldMinus,
  Users,
  X,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ImportMembersButton } from "./import-members-button";
import { MemberOfficeAssignmentDialog } from "./member-office-assignment-dialog";
import { MemberDetailsSheet } from "./member-details-sheet";
import { MemberQrCodeDialog } from "./member-qr-code-dialog";
import {
  branchOfServiceOptions,
  mapMemberToRecord,
  memberTypeFilterOptions,
  type MemberRecord,
} from "./members-data";
import { MembersDataTable } from "./members-data-table";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { Button } from "@/components/ui/button";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import {
  useArchiveMemberMutation,
  useChangeMemberPasswordByAdminMutation,
  useDeleteMemberMutation,
  useMembersQuery,
  useRetrieveMemberMutation,
  useUpdateMemberUniqueIdMutation,
  useUpdateMemberMutation,
  useUpdateMemberStatusMutation,
  useVerifyMemberEmailMutation,
} from "@/features/members/member.hooks";
import { useToast } from "@/hooks/use-toast";
import { MemberStatus, MemberType } from "@/enums";
import { mapAdminMemberToUpdatePayload } from "./member-form-mappers";
import { toApiError } from "@/lib/http-client";

type MembersViewMode = "grid" | "table";
type StatusTabValue = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
type MemberArchiveAction = "archive" | "retrieve";
const NO_BRANCHES_FILTER_VALUE = "Not Specified";

export function MembersPageContent() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<MembersViewMode>("table");
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
  const [detailsMemberId, setDetailsMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("all");
  const [branchOfServiceFilter, setBranchOfServiceFilter] =
    useState<string>("all");
  const [applicationDateRange, setApplicationDateRange] = useState<
    DateRange | undefined
  >();
  const [pageSize, setPageSize] = useState(12);
  const [pageIndex, setPageIndex] = useState(0);
  const [tableSorting, setTableSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useMembersQuery({
    limit: 100,
    includeArchived: true,
  });
  const archiveMemberMutation = useArchiveMemberMutation();
  const retrieveMemberMutation = useRetrieveMemberMutation();
  const updateMemberMutation = useUpdateMemberMutation();
  const updateMemberUniqueIdMutation = useUpdateMemberUniqueIdMutation();
  const updateMemberStatusMutation = useUpdateMemberStatusMutation();
  const changeMemberPasswordMutation = useChangeMemberPasswordByAdminMutation();
  const verifyMemberEmailMutation = useVerifyMemberEmailMutation();
  const deleteMemberMutation = useDeleteMemberMutation();
  const [isBatchQrPending, setIsBatchQrPending] = useState(false);
  const [updatingMemberTypeId, setUpdatingMemberTypeId] = useState<
    string | null
  >(null);
  const [updatingMemberUniqueIdId, setUpdatingMemberUniqueIdId] = useState<
    string | null
  >(null);
  const [updatingMemberStatusId, setUpdatingMemberStatusId] = useState<
    string | null
  >(null);
  const [changingMemberPasswordId, setChangingMemberPasswordId] = useState<
    string | null
  >(null);
  const [verifyingMemberEmailId, setVerifyingMemberEmailId] = useState<
    string | null
  >(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

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
      return applyMembersFilters(
        members,
        searchQuery,
        memberTypeFilter,
        branchOfServiceFilter,
        applicationDateRange,
      );
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

    return applyMembersFilters(
      members.filter((member) => member.status === statusByTab[statusTab]),
      searchQuery,
      memberTypeFilter,
      branchOfServiceFilter,
      applicationDateRange,
    );
  }, [
    applicationDateRange,
    branchOfServiceFilter,
    memberTypeFilter,
    members,
    searchQuery,
    statusTab,
  ]);

  const visibleMemberTypeOptions = useMemo(
    () =>
      memberTypeFilterOptions.filter((option) =>
        members.some((member) => member.memberTypeValue === option.value),
      ),
    [members],
  );
  const visibleBranchOfServiceOptions = useMemo(
    () =>
      branchOfServiceOptions.filter((option) =>
        members.some((member) => member.branchOfServiceValues.includes(option)),
      ),
    [members],
  );
  const hasMembersWithoutBranches = useMemo(
    () => members.some((member) => member.branchOfServiceValues.length === 0),
    [members],
  );

  const hasActiveFilters =
    branchOfServiceFilter !== "all" ||
    memberTypeFilter !== "all" ||
    Boolean(applicationDateRange?.from || applicationDateRange?.to);
  const applicationDateFromTime = applicationDateRange?.from?.getTime();
  const applicationDateToTime = applicationDateRange?.to?.getTime();

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
  }, [
    applicationDateFromTime,
    applicationDateToTime,
    branchOfServiceFilter,
    memberTypeFilter,
    searchQuery,
    statusTab,
    tableSorting,
  ]);

  const membersToolbar = (
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
          className="lg:w-90 px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
          <SelectTrigger className="w-full lg:w-40">
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
          <SelectTrigger className="w-full lg:w-40">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal md:w-60",
                !applicationDateRange?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4" />
              {applicationDateRange?.from
                ? applicationDateRange.to
                  ? `${format(applicationDateRange.from, "MMM d, yyyy")} - ${format(
                      applicationDateRange.to,
                      "MMM d, yyyy",
                    )}`
                  : format(applicationDateRange.from, "MMM d, yyyy")
                : "Filter by application date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={applicationDateRange}
              onSelect={setApplicationDateRange}
              numberOfMonths={2}
              defaultMonth={applicationDateRange?.from}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters || searchQuery.trim() ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setMemberTypeFilter("all");
              setBranchOfServiceFilter("all");
              setApplicationDateRange(undefined);
            }}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );

  const paginationControls = (
    <div className="flex flex-col gap-3 mt-5 px-1 md:flex-row md:items-center md:justify-between">
      <div className="text-muted-foreground flex-1 text-sm">
        Showing {sortedMembers.length === 0 ? 0 : pageIndex * pageSize + 1}-
        {Math.min((pageIndex + 1) * pageSize, sortedMembers.length)} of{" "}
        {sortedMembers.length} member(s).
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
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Go to previous page</span>
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
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:flex"
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

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
        link.download = `${buildQrFileBaseName(
          member.lastName,
          member.firstName,
          member.uniqueId ?? member.id,
        )}.png`;
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
    setDetailsMemberId(member.memberId);
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

  const handleUpdateMemberUniqueId = async (
    member: MemberRecord,
    uniqueId: string,
  ) => {
    const normalizedUniqueId = uniqueId.trim();

    if (!normalizedUniqueId) {
      toast({
        variant: "warning",
        title: "Member ID required",
        description: "Please enter a member ID before saving.",
      });
      throw new Error("Member ID is required.");
    }

    if (member.uniqueId === normalizedUniqueId) {
      return;
    }

    const duplicateMember = members.find(
      (item) =>
        item.memberId !== member.memberId &&
        item.uniqueId?.trim().toLowerCase() ===
          normalizedUniqueId.toLowerCase(),
    );

    if (duplicateMember) {
      toast({
        variant: "error",
        title: "Member ID already exists",
        description: `${normalizedUniqueId} is already assigned to ${duplicateMember.fullName}.`,
      });
      throw new Error("Member ID already exists.");
    }

    try {
      setUpdatingMemberUniqueIdId(member.memberId);
      await updateMemberUniqueIdMutation.mutateAsync({
        memberId: member.memberId,
        uniqueId: normalizedUniqueId,
      });
      toast({
        variant: "success",
        title: "Member ID updated",
        description: `${member.fullName} is now assigned ${normalizedUniqueId}.`,
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Update failed",
        description:
          apiError.message ?? "Unable to update the member ID right now.",
      });
      throw new Error(apiError.message ?? "Unable to update member ID.");
    } finally {
      setUpdatingMemberUniqueIdId(null);
    }
  };

  const handleUpdateMemberStatus = async (
    member: MemberRecord,
    status: "Approved" | "Pending" | "Rejected" | "Archived",
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
        if (!sourceMember.isActive) {
          return;
        }

        await archiveMemberMutation.mutateAsync(member.memberId);
      } else {
        if (!sourceMember.isActive) {
          await retrieveMemberMutation.mutateAsync(member.memberId);
        }

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
        description: `${member.fullName} is now set to ${status}.`,
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

  const handleChangeMemberPassword = async (
    member: MemberRecord,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      setChangingMemberPasswordId(member.memberId);
      await changeMemberPasswordMutation.mutateAsync({
        memberId: member.memberId,
        password,
        confirmPassword,
      });
      toast({
        variant: "success",
        title: "Password updated",
        description: `${member.fullName}'s password has been changed.`,
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Password update failed",
        description:
          apiError.message ?? "Unable to update the member password right now.",
      });
      throw new Error(apiError.message ?? "Unable to update member password.");
    } finally {
      setChangingMemberPasswordId(null);
    }
  };

  const handleVerifyMemberEmail = async (member: MemberRecord) => {
    if (member.isEmailVerified) {
      toast({
        variant: "success",
        title: "Email already verified",
        description: `${member.email} is already marked as verified.`,
      });
      return;
    }

    try {
      setVerifyingMemberEmailId(member.memberId);
      await verifyMemberEmailMutation.mutateAsync(member.memberId);
      toast({
        variant: "success",
        title: "Email verified",
        description: `${member.email} is now marked as verified.`,
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Email verification failed",
        description:
          apiError.message ?? "Unable to verify the member email right now.",
      });
      throw new Error(apiError.message ?? "Unable to verify member email.");
    } finally {
      setVerifyingMemberEmailId(null);
    }
  };

  const handleDeleteMember = async (member: MemberRecord) => {
    try {
      setDeletingMemberId(member.memberId);
      await deleteMemberMutation.mutateAsync(member.memberId);
      toast({
        variant: "success",
        title: "Member deleted",
        description: `${member.fullName} has been permanently deleted.`,
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Delete failed",
        description:
          apiError.message ?? "Unable to delete the member right now.",
      });
      throw new Error(apiError.message ?? "Unable to delete member.");
    } finally {
      setDeletingMemberId(null);
    }
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
          : verifyMemberEmailMutation.isPending
            ? "Verifying member email..."
        : deleteMemberMutation.isPending
          ? "Deleting member record..."
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
                <SummaryStatCard
                  label="Total Members"
                  value={totalMembers}
                  description="All recorded member profiles"
                  icon={<Users className="size-4" />}
                  accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
                  active={statusTab === "ALL"}
                  onClick={() => setStatusTab("ALL")}
                />
                <SummaryStatCard
                  label="Approved"
                  value={approvedMembers}
                  description="Fully endorsed members"
                  icon={<CheckCircle2 className="size-4" />}
                  accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
                  active={statusTab === "APPROVED"}
                  onClick={() => setStatusTab("APPROVED")}
                />
                <SummaryStatCard
                  label="Pending"
                  value={pendingMembers}
                  description="Awaiting review and validation"
                  icon={<Clock3 className="size-4" />}
                  accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
                  active={statusTab === "PENDING"}
                  onClick={() => setStatusTab("PENDING")}
                />
                <SummaryStatCard
                  label="Archived"
                  value={archivedMembers}
                  description={`Archived profiles, with ${rejectedMembers} rejected applications.`}
                  icon={<ShieldAlert className="size-4" />}
                  accentClassName="bg-red-700/10 text-red-700 dark:bg-red-300/10 dark:text-red-300"
                  active={statusTab === "ARCHIVED"}
                  onClick={() => setStatusTab("ARCHIVED")}
                />
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
                ) : (
                  <>
                    {membersToolbar}
                    {viewMode === "grid" ? (
                      <MembersGridView
                        data={paginatedMembers}
                        isArchiveActionPending={isArchiveActionPending}
                        emptyMessage={
                          hasActiveFilters || searchQuery.trim()
                            ? "No members match the selected filters."
                            : undefined
                        }
                        onViewDetails={handleViewDetails}
                        onEditDetails={handleEditDetails}
                        onAssignOffice={handleAssignOffice}
                        onRequestToggleMemberArchiveState={handleSuspendMember}
                        onGenerateQrCode={handleGenerateQrCode}
                      />
                    ) : (
                      <MembersDataTable
                        data={paginatedMembers}
                        bulkActionLabel={
                          statusTab === "ARCHIVED" ? "Retrieve" : "Archive"
                        }
                        sorting={tableSorting}
                        onSortingChange={setTableSorting}
                        updatingMemberTypeId={updatingMemberTypeId}
                        updatingMemberUniqueIdId={updatingMemberUniqueIdId}
                        updatingMemberStatusId={updatingMemberStatusId}
                        changingMemberPasswordId={changingMemberPasswordId}
                        verifyingMemberEmailId={verifyingMemberEmailId}
                        deletingMemberId={deletingMemberId}
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
                        onUpdateMemberUniqueId={handleUpdateMemberUniqueId}
                        onUpdateMemberType={handleUpdateMemberType}
                        onUpdateMemberStatus={handleUpdateMemberStatus}
                        onChangeMemberPassword={handleChangeMemberPassword}
                        onVerifyMemberEmail={handleVerifyMemberEmail}
                        onDeleteMember={handleDeleteMember}
                      />
                    )}
                    {paginationControls}
                  </>
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
            <AlertDialogCancel
              size="sm"
              onClick={() => setPendingMemberAction(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
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
  emptyMessage,
  onViewDetails,
  onEditDetails,
  onAssignOffice,
  onRequestToggleMemberArchiveState,
  onGenerateQrCode,
}: {
  data: MemberRecord[];
  isArchiveActionPending: boolean;
  emptyMessage?: string;
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
        description={
          emptyMessage ??
          "Get started by adding a new member manually or importing your data via Excel."
        }
        createUrl="/members/new"
        createLabel="Add new member"
      />
    );
  }

  return (
    <div className="grid gap-5 mt-5 sm:grid-cols-2 xl:grid-cols-3">
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
                <AvatarFallback className="text-4xl font-bold rounded-none bg-accent">
                  {getMemberInitials(member.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="space-y-4 px-6 py-5 pt-0!">
            <div className="space-y-1">
              <h3 className="text-xl uppercase font-semibold tracking-tight">
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

function applyMembersFilters(
  members: MemberRecord[],
  searchQuery: string,
  memberTypeFilter: string,
  branchOfServiceFilter: string,
  applicationDateRange: DateRange | undefined,
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
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
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

    if (!applicationDateRange?.from && !applicationDateRange?.to) {
      return true;
    }

    const appliedAt = new Date(member.appliedAt);

    if (Number.isNaN(appliedAt.getTime())) {
      return false;
    }

    if (
      applicationDateRange.from &&
      isBefore(appliedAt, startOfDay(applicationDateRange.from))
    ) {
      return false;
    }

    const rangeEnd = applicationDateRange.to ?? applicationDateRange.from;

    if (rangeEnd && isAfter(appliedAt, endOfDay(rangeEnd))) {
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
        comparison = left.memberType.localeCompare(
          right.memberType,
          undefined,
          {
            sensitivity: "base",
          },
        );
        break;
      case "branchOfService":
        comparison = left.branchOfService.localeCompare(
          right.branchOfService,
          undefined,
          {
            sensitivity: "base",
          },
        );
        break;
      case "status":
        comparison = left.status.localeCompare(right.status, undefined, {
          sensitivity: "base",
        });
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

  if (!leftParsed && !rightParsed) {
    return 0;
  }

  if (!leftParsed) {
    return 1;
  }

  if (!rightParsed) {
    return -1;
  }

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
  if (prefix === "262") {
    return 0;
  }

  if (prefix === "261") {
    return 1;
  }

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
