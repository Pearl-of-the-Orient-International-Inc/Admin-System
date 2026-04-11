"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, GitBranchPlus, Layers3, TextIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { toApiError } from "@/features/auth/auth.hooks";
import {
  useBranchServicesQuery,
  useDeleteBranchServiceMutation,
} from "@/features/branch-service/branch-service.hooks";
import { useMembersQuery } from "@/features/members/member.hooks";
import { useToast } from "@/hooks/use-toast";
import { BranchServicesDataTable } from "./branch-services-data-table";
import { CreateBranchServiceButton } from "./create-branch-service-button";
import { SummaryStatCard } from "@/components/SummaryStatCard";

type BranchServiceSummarySort =
  | "DEFAULT"
  | "SECTIONS"
  | "MEMBERS"
  | "DESCRIPTION_SIZE";

export function BranchServicePageContent() {
  const { toast } = useToast();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [summarySort, setSummarySort] =
    useState<BranchServiceSummarySort>("DEFAULT");

  const branchServicesQuery = useBranchServicesQuery({
    page: 1,
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const membersQuery = useMembersQuery({
    limit: 100,
    includeArchived: true,
  });
  const deleteBranchServiceMutation = useDeleteBranchServiceMutation();

  const branchServices = useMemo(() => {
    const items = branchServicesQuery.data?.items ?? [];
    const members = membersQuery.data?.data ?? [];

    return items.map((branchService) => {
      const normalizedTitle = branchService.title.trim().toLowerCase();

      const memberCount = members.filter((member) => {
        const preferredBranchMatch =
          member.preferredBranches?.some(
            (branch) => branch.title.trim().toLowerCase() === normalizedTitle,
          ) ?? false;

        if (preferredBranchMatch) {
          return true;
        }

        return member.preferredBranchOther?.trim().toLowerCase() === normalizedTitle;
      }).length;

      return {
        ...branchService,
        memberCount,
      };
    });
  }, [branchServicesQuery.data?.items, membersQuery.data?.data]);
  const visibleBranchServices = useMemo(() => {
    if (summarySort === "SECTIONS") {
      return [...branchServices].sort(
        (left, right) =>
          (right.sections?.length ?? 0) - (left.sections?.length ?? 0),
      );
    }

    if (summarySort === "MEMBERS") {
      return [...branchServices].sort(
        (left, right) => (right.memberCount ?? 0) - (left.memberCount ?? 0),
      );
    }

    if (summarySort === "DESCRIPTION_SIZE") {
      return [...branchServices].sort(
        (left, right) => right.description.length - left.description.length,
      );
    }

    return branchServices;
  }, [branchServices, summarySort]);
  const totalBranchServices = branchServices.length;
  const hasNoBranchServices =
    !branchServicesQuery.isLoading &&
    !branchServicesQuery.isError &&
    branchServices.length === 0;

  const totalSections = useMemo(
    () =>
      branchServices.reduce(
        (count, branchService) => count + (branchService.sections?.length ?? 0),
        0,
      ),
    [branchServices],
  );

  const averageSections = totalBranchServices
    ? (totalSections / totalBranchServices).toFixed(1)
    : "0.0";

  const totalDescriptionLength = useMemo(
    () =>
      branchServices.reduce(
        (count, branchService) => count + branchService.description.length,
        0,
      ),
    [branchServices],
  );

  const requestDeleteBranchService = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleDeleteBranchServices = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteBranchServiceMutation.mutateAsync(id)));
      toast({
        title: "Branch services deleted",
        description: `${ids.length} branch service(s) removed successfully.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Delete failed",
        description: apiError.message ?? "Unable to delete selected branch services.",
        variant: "error",
      });
    }
  };

  const confirmDeleteBranchService = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteBranchServiceMutation.mutateAsync(deleteTargetId);
      toast({
        title: "Branch service deleted",
        description: "Branch service has been removed successfully.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Delete failed",
        description: apiError.message ?? "Unable to delete branch service.",
        variant: "error",
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Branch of Service</h1>
          <p className="text-muted-foreground text-sm">
            Create and maintain branch services with section-based content.
          </p>
        </div>
        {!hasNoBranchServices && (
          <CreateBranchServiceButton />
        )}
      </div>

      {hasNoBranchServices ? (
        <PageEmptyState
          title="No branch services found"
          description="Create your first branch of service to start organizing section-based content."
          createUrl="/branch-service/new"
          createLabel="Create branch service"
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Branch Service Summary</CardTitle>
              <CardDescription>
                Quick overview of currently registered branch services.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryStatCard
                label="Total"
                value={totalBranchServices}
                icon={<GitBranchPlus className="size-4" />}
                accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
                active={summarySort === "DEFAULT"}
                onClick={() => setSummarySort("DEFAULT")}
              />
              <SummaryStatCard
                label="Sections"
                value={totalSections}
                description="Click to sort branches by section count"
                icon={<Layers3 className="size-4" />}
                accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
                active={summarySort === "SECTIONS"}
                onClick={() => setSummarySort("SECTIONS")}
              />
              <SummaryStatCard
                label="Avg. Sections"
                value={averageSections}
                description="Click to sort branches by member count"
                icon={<Layers3 className="size-4" />}
                accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
                active={summarySort === "MEMBERS"}
                onClick={() => setSummarySort("MEMBERS")}
              />
              <SummaryStatCard
                label="Description Size"
                value={totalDescriptionLength}
                description="Click to sort branches by description length"
                icon={<TextIcon className="size-4" />}
                accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
                active={summarySort === "DESCRIPTION_SIZE"}
                onClick={() => setSummarySort("DESCRIPTION_SIZE")}
              />
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Branch Service Directory</CardTitle>
              <CardDescription>
                Search, export, and manage branch services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {branchServicesQuery.isLoading ? (
                <PageLoadingState mode="table" />
              ) : branchServicesQuery.isError || membersQuery.isError ? (
                <PageErrorState
                  title="Unable to load branch services"
                  description={
                    branchServicesQuery.error instanceof Error
                      ? branchServicesQuery.error.message
                      : membersQuery.error instanceof Error
                        ? membersQuery.error.message
                      : "Branch service records could not be loaded right now."
                  }
                  backUrl="/dashboard"
                  backLabel="Back to dashboard"
                />
              ) : (
                <BranchServicesDataTable
                  data={visibleBranchServices}
                  onDeleteBranchService={requestDeleteBranchService}
                  onDeleteBranchServices={handleDeleteBranchServices}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this branch service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteBranchService}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
