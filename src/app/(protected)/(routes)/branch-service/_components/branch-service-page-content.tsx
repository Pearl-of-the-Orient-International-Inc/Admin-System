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
import { useToast } from "@/hooks/use-toast";
import { BranchServicesDataTable } from "./branch-services-data-table";
import { CreateBranchServiceButton } from "./create-branch-service-button";

export function BranchServicePageContent() {
  const { toast } = useToast();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const branchServicesQuery = useBranchServicesQuery({
    page: 1,
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const deleteBranchServiceMutation = useDeleteBranchServiceMutation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const branchServices = branchServicesQuery.data?.items ?? [];
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
              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Total</p>
                  <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                    <GitBranchPlus className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{totalBranchServices}</p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Sections</p>
                  <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                    <Layers3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{totalSections}</p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Avg. Sections
                  </p>
                  <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                    <Layers3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{averageSections}</p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Description Size
                  </p>
                  <span className="rounded-md bg-violet-700/10 p-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300">
                    <TextIcon className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{totalDescriptionLength}</p>
              </div>
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
              ) : branchServicesQuery.isError ? (
                <PageErrorState
                  title="Unable to load branch services"
                  description={
                    branchServicesQuery.error instanceof Error
                      ? branchServicesQuery.error.message
                      : "Branch service records could not be loaded right now."
                  }
                  backUrl="/dashboard"
                  backLabel="Back to dashboard"
                />
              ) : (
                <BranchServicesDataTable
                  data={branchServices}
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
