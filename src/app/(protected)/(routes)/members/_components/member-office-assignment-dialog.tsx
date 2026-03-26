"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronsUpDown,
  History,
  RefreshCcw,
  ShieldMinus,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberStatus, OfficeTitleLevel } from "@/enums";
import { toApiError } from "@/features/auth/auth.hooks";
import { useMembersQuery } from "@/features/members/member.hooks";
import { useOfficeTitlesQuery } from "@/features/office-title/office-title.hooks";
import {
  useCreateOfficerAssignmentMutation,
  useDeactivateOfficerAssignmentMutation,
  useMemberOfficerAssignmentsQuery,
  useReplaceOfficerAssignmentMutation,
} from "@/features/officer-assignment/officer-assignment.hooks";
import type { OfficerAssignmentResource } from "@/features/officer-assignment/officer-assignment.types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AdminMember } from "@/lib/api-types";
import type { MemberRecord } from "./members-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MemberOfficeAssignmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
};

type AssignmentFormState = {
  officeTitleId: string;
  department: string;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  startDate: string;
};

const emptyForm: AssignmentFormState = {
  officeTitleId: "",
  department: "",
  region: "",
  province: "",
  cityMunicipality: "",
  barangay: "",
  startDate: "",
};

const formatOfficeTitleLevel = (level: string) =>
  level
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const buildFullName = (member: AdminMember) =>
  [
    member.firstName,
    member.middleInitial?.trim(),
    member.lastName,
    member.extensionName?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

const getRequiredJurisdictionField = (level?: string | null) => {
  switch (level) {
    case OfficeTitleLevel.NATIONAL_CHAPLAIN_DIRECTOR:
      return "department";
    case OfficeTitleLevel.REGIONAL_CHAPLAIN_DIRECTOR:
    case OfficeTitleLevel.REGIONAL_DEPUTY_CHAPLAIN_DIRECTOR:
      return "region";
    case OfficeTitleLevel.PROVINCIAL_CHAPLAIN_DIRECTOR:
    case OfficeTitleLevel.PROVINCIAL_DEPUTY_CHAPLAIN_DIRECTOR:
      return "province";
    case OfficeTitleLevel.CITY_CHAPLAIN:
    case OfficeTitleLevel.MUNICIPAL_CHAPLAIN:
    case OfficeTitleLevel.CITY_MUNICIPAL_DEPUTY_CHAPLAIN:
      return "cityMunicipality";
    case OfficeTitleLevel.BARANGAY_CHAPLAIN:
    case OfficeTitleLevel.BARANGAY_DEPUTY_CHAPLAIN:
      return "barangay";
    default:
      return null;
  }
};

const getJurisdictionLabel = (field: string | null) => {
  switch (field) {
    case "department":
      return "Department";
    case "region":
      return "Region";
    case "province":
      return "Province";
    case "cityMunicipality":
      return "City / Municipality";
    case "barangay":
      return "Barangay";
    default:
      return null;
  }
};

const formatJurisdiction = (assignment: OfficerAssignmentResource) =>
  [
    assignment.department,
    assignment.region,
    assignment.province,
    assignment.cityMunicipality,
    assignment.barangay,
  ]
    .filter(Boolean)
    .join(" · ");

export function MemberOfficeAssignmentDialog({
  open,
  onOpenChange,
  member,
}: MemberOfficeAssignmentDialogProps) {
  const { toast } = useToast();
  const [officePickerOpen, setOfficePickerOpen] = useState(false);
  const [replacePickerOpen, setReplacePickerOpen] = useState(false);
  const [form, setForm] = useState<AssignmentFormState>(emptyForm);
  const [deactivateTarget, setDeactivateTarget] =
    useState<OfficerAssignmentResource | null>(null);
  const [replaceTarget, setReplaceTarget] =
    useState<OfficerAssignmentResource | null>(null);
  const [replacementMemberId, setReplacementMemberId] = useState("");

  const officeTitlesQuery = useOfficeTitlesQuery({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const memberAssignmentsQuery = useMemberOfficerAssignmentsQuery(
    member?.memberId ?? "",
    Boolean(open && member),
  );
  const membersQuery = useMembersQuery({
    page: 1,
    limit: 100,
    includeArchived: false,
  });

  const createOfficerAssignmentMutation = useCreateOfficerAssignmentMutation();
  const deactivateOfficerAssignmentMutation =
    useDeactivateOfficerAssignmentMutation();
  const replaceOfficerAssignmentMutation =
    useReplaceOfficerAssignmentMutation();

  const activeOfficeTitles = useMemo(
    () =>
      (officeTitlesQuery.data?.items ?? []).filter(
        (officeTitle) => officeTitle.isActive,
      ),
    [officeTitlesQuery.data],
  );

  const selectedOfficeTitle = useMemo(
    () =>
      activeOfficeTitles.find(
        (officeTitle) => officeTitle.id === form.officeTitleId,
      ) ?? null,
    [activeOfficeTitles, form.officeTitleId],
  );

  const replacementCandidates = useMemo(
    () =>
      (membersQuery.data?.data ?? []).filter(
        (candidate) =>
          candidate.id !== member?.memberId &&
          candidate.isActive &&
          candidate.status === MemberStatus.APPROVED,
      ),
    [member?.memberId, membersQuery.data],
  );

  const selectedReplacementMember = useMemo(
    () =>
      replacementCandidates.find(
        (candidate) => candidate.id === replacementMemberId,
      ) ?? null,
    [replacementCandidates, replacementMemberId],
  );

  const assignments = memberAssignmentsQuery.data ?? [];
  const requiredJurisdictionField = getRequiredJurisdictionField(
    selectedOfficeTitle?.level ?? null,
  );
  const requiredJurisdictionLabel = getJurisdictionLabel(
    requiredJurisdictionField,
  );
  const isAssigning = createOfficerAssignmentMutation.isPending;
  const isInvalid =
    !member ||
    !form.officeTitleId ||
    Boolean(
      requiredJurisdictionField &&
      !form[requiredJurisdictionField as keyof AssignmentFormState]?.trim(),
    );

  const setField = <K extends keyof AssignmentFormState>(
    key: K,
    value: AssignmentFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetState = () => {
    setOfficePickerOpen(false);
    setReplacePickerOpen(false);
    setForm(emptyForm);
    setDeactivateTarget(null);
    setReplaceTarget(null);
    setReplacementMemberId("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const handleSubmit = async () => {
    if (!member || !selectedOfficeTitle) return;

    try {
      await createOfficerAssignmentMutation.mutateAsync({
        memberId: member.memberId,
        payload: {
          officeTitleId: selectedOfficeTitle.id,
          department: form.department.trim() || undefined,
          region: form.region.trim() || undefined,
          province: form.province.trim() || undefined,
          cityMunicipality: form.cityMunicipality.trim() || undefined,
          barangay: form.barangay.trim() || undefined,
          startDate: form.startDate
            ? new Date(form.startDate).toISOString()
            : undefined,
        },
      });

      toast({
        variant: "success",
        title: "Office assigned",
        description: `${member.fullName} has been assigned to ${selectedOfficeTitle.name}.`,
      });

      setForm(emptyForm);
      setOfficePickerOpen(false);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Assignment failed",
        description:
          apiError.message ??
          "Unable to assign this office to the selected member.",
      });
    }
  };

  const handleDeactivate = async () => {
    if (!member || !deactivateTarget) return;

    try {
      await deactivateOfficerAssignmentMutation.mutateAsync({
        memberId: member.memberId,
        assignmentId: deactivateTarget.id,
      });
      toast({
        variant: "success",
        title: "Assignment deactivated",
        description: `${deactivateTarget.officeTitle.name} is no longer active for ${member.fullName}.`,
      });
      setDeactivateTarget(null);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Deactivate failed",
        description:
          apiError.message ?? "Unable to deactivate this office assignment.",
      });
    }
  };

  const handleReplace = async () => {
    if (!member || !replaceTarget || !selectedReplacementMember) return;

    try {
      await replaceOfficerAssignmentMutation.mutateAsync({
        memberId: member.memberId,
        assignmentId: replaceTarget.id,
        payload: {
          replacementMemberId: selectedReplacementMember.id,
        },
      });
      toast({
        variant: "success",
        title: "Office holder replaced",
        description: `${selectedReplacementMember.user.name} now holds ${replaceTarget.officeTitle.name}.`,
      });
      setReplaceTarget(null);
      setReplacementMemberId("");
      setReplacePickerOpen(false);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        variant: "error",
        title: "Replacement failed",
        description:
          apiError.message ?? "Unable to replace this office holder right now.",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-7xl!">
          <DialogHeader>
            <DialogTitle>Manage Office Assignments</DialogTitle>
            <DialogDescription>
              {member
                ? `Assign offices, replace current holders, and review assignment history for ${member.fullName}.`
                : "Select a member first before managing office assignments."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4 rounded-xl border bg-muted/20 h-fit p-4">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">
                  Assign New Office
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add a new active office assignment for this member.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Office title</Label>
                {officeTitlesQuery.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Popover
                    open={officePickerOpen}
                    onOpenChange={setOfficePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={officePickerOpen}
                        className="w-full justify-between"
                        disabled={activeOfficeTitles.length === 0}
                      >
                        {selectedOfficeTitle
                          ? `${selectedOfficeTitle.name} (${formatOfficeTitleLevel(
                              selectedOfficeTitle.level,
                            )})`
                          : activeOfficeTitles.length === 0
                            ? "No active office titles available"
                            : "Select office title..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-155 p-0">
                      <Command>
                        <CommandInput placeholder="Search office titles..." />
                        <CommandList>
                          <CommandEmpty>No office titles found.</CommandEmpty>
                          <CommandGroup>
                            {activeOfficeTitles.map((officeTitle) => (
                              <CommandItem
                                key={officeTitle.id}
                                value={`${officeTitle.name} ${officeTitle.level}`}
                                onSelect={() => {
                                  setField("officeTitleId", officeTitle.id);
                                  setOfficePickerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "size-4",
                                    form.officeTitleId === officeTitle.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{officeTitle.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {formatOfficeTitleLevel(officeTitle.level)}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {selectedOfficeTitle ? (
                <div className="rounded-lg border bg-card px-3 py-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {selectedOfficeTitle.name}
                      </p>
                      <p>
                        {selectedOfficeTitle.description ??
                          "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment-start-date">Start date</Label>
                  <Input
                    id="assignment-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setField("startDate", event.target.value)
                    }
                  />
                </div>
                {requiredJurisdictionField && requiredJurisdictionLabel ? (
                  <div className="space-y-2">
                    <Label htmlFor={`assignment-${requiredJurisdictionField}`}>
                      {requiredJurisdictionLabel}
                    </Label>
                    <Input
                      id={`assignment-${requiredJurisdictionField}`}
                      value={form[requiredJurisdictionField]}
                      onChange={(event) =>
                        setField(
                          requiredJurisdictionField,
                          event.target
                            .value as AssignmentFormState[keyof AssignmentFormState],
                        )
                      }
                      placeholder={`Enter ${requiredJurisdictionLabel.toLowerCase()}`}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={isInvalid || isAssigning}
                >
                  {isAssigning ? "Assigning..." : "Assign office"}
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <h3 className="font-medium text-foreground">
                    Assignment History
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review active and previous office assignments for this member.
                </p>
              </div>

              {memberAssignmentsQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-22 w-full" />
                  <Skeleton className="h-22 w-full" />
                </div>
              ) : memberAssignmentsQuery.isError ? (
                <div className="text-destructive flex min-h-48 items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm">
                  {memberAssignmentsQuery.error instanceof Error
                    ? memberAssignmentsQuery.error.message
                    : "Unable to load assignment history right now."}
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-muted-foreground flex min-h-48 items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm">
                  No office assignments yet for this member.
                </div>
              ) : (
                <ScrollArea className="h-105 pr-4">
                  <div className="space-y-3">
                    {assignments.map((assignment) => {
                      const jurisdiction = formatJurisdiction(assignment);

                      return (
                        <div
                          key={assignment.id}
                          className="rounded-xl border bg-muted/15 p-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  {assignment.officeTitle.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline">
                                    {formatOfficeTitleLevel(
                                      assignment.officeTitle.level,
                                    )}
                                  </Badge>
                                  <Badge
                                    variant={
                                      assignment.isActive
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {assignment.isActive
                                      ? "Active"
                                      : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              {assignment.isActive ? (
                                <div className="flex flex-wrap gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          setReplaceTarget(assignment)
                                        }
                                      >
                                        <RefreshCcw className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Replace holder
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          setDeactivateTarget(assignment)
                                        }
                                      >
                                        <ShieldMinus className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove office title</TooltipContent>
                                  </Tooltip>
                                </div>
                              ) : null}
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                Started on {formatDate(assignment.startDate)}
                                {assignment.endDate
                                  ? ` · Ended on ${formatDate(assignment.endDate)}`
                                  : ""}
                              </p>
                              {jurisdiction ? <p>{jurisdiction}</p> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeactivateTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate this office assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget
                ? `${deactivateTarget.officeTitle.name} will be marked inactive for ${member?.fullName}.`
                : "This assignment will be marked inactive."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeactivateTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeactivate()}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(replaceTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setReplaceTarget(null);
            setReplacementMemberId("");
            setReplacePickerOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-xl!">
          <DialogHeader>
            <DialogTitle>Replace Office Holder</DialogTitle>
            <DialogDescription>
              {replaceTarget
                ? `Transfer ${replaceTarget.officeTitle.name} to another approved member.`
                : "Select the replacement member."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {replaceTarget ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {replaceTarget.officeTitle.name}
                  </p>
                  <p>
                    {formatJurisdiction(replaceTarget) || "No jurisdiction"}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Replacement member</Label>
              {membersQuery.isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Popover
                  open={replacePickerOpen}
                  onOpenChange={setReplacePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={replacePickerOpen}
                      className="w-full justify-between"
                      disabled={replacementCandidates.length === 0}
                    >
                      {selectedReplacementMember
                        ? buildFullName(selectedReplacementMember)
                        : replacementCandidates.length === 0
                          ? "No eligible replacement members"
                          : "Select replacement member..."}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-120 p-0">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandList>
                        <CommandEmpty>No approved members found.</CommandEmpty>
                        <CommandGroup>
                          {replacementCandidates.map((candidate) => (
                            <CommandItem
                              key={candidate.id}
                              value={`${buildFullName(candidate)} ${candidate.user.email}`}
                              onSelect={() => {
                                setReplacementMemberId(candidate.id);
                                setReplacePickerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "size-4",
                                  replacementMemberId === candidate.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{buildFullName(candidate)}</span>
                                <span className="text-muted-foreground text-xs">
                                  {candidate.user.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplaceTarget(null);
                setReplacementMemberId("");
                setReplacePickerOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleReplace()}
              disabled={
                !selectedReplacementMember ||
                replaceOfficerAssignmentMutation.isPending
              }
            >
              {replaceOfficerAssignmentMutation.isPending
                ? "Replacing..."
                : "Replace holder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
