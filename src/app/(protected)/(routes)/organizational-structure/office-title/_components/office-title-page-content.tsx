"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Layers3,
  UsersRound,
} from "lucide-react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toApiError } from "@/features/auth/auth.hooks";
import {
  useArchiveOfficeTitleMutation,
  useOfficeTitlesQuery,
  useRetrieveOfficeTitleMutation,
} from "@/features/office-title/office-title.hooks";
import { useToast } from "@/hooks/use-toast";
import { CreateOfficeTitleButton } from "./create-office-title-button";
import { OfficeTitlesDataTable } from "./office-titles-data-table";

export function OfficeTitlePageContent() {
  const { toast } = useToast();
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );

  const officeTitlesQuery = useOfficeTitlesQuery({
    page: 1,
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const archiveOfficeTitleMutation = useArchiveOfficeTitleMutation();
  const retrieveOfficeTitleMutation = useRetrieveOfficeTitleMutation();

  const officeTitles = useMemo(
    () => officeTitlesQuery.data?.items ?? [],
    [officeTitlesQuery.data?.items],
  );
  const hasQueryError = officeTitlesQuery.isError;
  const hasNoOfficeTitles =
    !officeTitlesQuery.isLoading &&
    !officeTitlesQuery.isError &&
    officeTitles.length === 0;
  const countValue = (value: number) => (hasQueryError ? "-" : String(value));

  const totalOfficeTitles = officeTitles.length;
  const activeOfficeTitles = useMemo(
    () => officeTitles.filter((officeTitle) => officeTitle.isActive).length,
    [officeTitles],
  );
  const inactiveOfficeTitles = totalOfficeTitles - activeOfficeTitles;
  const limitedOfficeTitles = useMemo(
    () =>
      officeTitles.filter((officeTitle) => officeTitle.maxSlots !== null)
        .length,
    [officeTitles],
  );
  const unlimitedOfficeTitles = totalOfficeTitles - limitedOfficeTitles;
  const totalSections = useMemo(
    () =>
      officeTitles.reduce(
        (count, officeTitle) => count + (officeTitle.sections?.length ?? 0),
        0,
      ),
    [officeTitles],
  );
  const uniqueLevels = useMemo(
    () => new Set(officeTitles.map((officeTitle) => officeTitle.level)).size,
    [officeTitles],
  );
  const filteredOfficeTitles = useMemo(() => {
    if (statusTab === "ACTIVE") {
      return officeTitles.filter((officeTitle) => officeTitle.isActive);
    }

    if (statusTab === "INACTIVE") {
      return officeTitles.filter((officeTitle) => !officeTitle.isActive);
    }

    return officeTitles;
  }, [officeTitles, statusTab]);

  const requestArchiveOfficeTitle = (id: string) => {
    setArchiveTargetId(id);
  };

  const handleArchiveOfficeTitles = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => archiveOfficeTitleMutation.mutateAsync(id)),
      );
      toast({
        title: "Office titles archived",
        description: `${ids.length} office title(s) archived successfully.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Archive failed",
        description:
          apiError.message ?? "Unable to archive selected office titles.",
        variant: "error",
      });
    }
  };

  const confirmArchiveOfficeTitle = async () => {
    if (!archiveTargetId) return;

    try {
      await archiveOfficeTitleMutation.mutateAsync(archiveTargetId);
      toast({
        title: "Office title archived",
        description: "Office title has been hidden successfully.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Archive failed",
        description: apiError.message ?? "Unable to archive office title.",
        variant: "error",
      });
    } finally {
      setArchiveTargetId(null);
    }
  };

  const handleRetrieveOfficeTitle = async (id: string) => {
    try {
      await retrieveOfficeTitleMutation.mutateAsync(id);
      toast({
        title: "Office title retrieved",
        description: "Office title is active again.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Retrieve failed",
        description: apiError.message ?? "Unable to retrieve office title.",
        variant: "error",
      });
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Office Titles
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage dynamic office titles that can later be assigned to members.
          </p>
        </div>
        {!hasNoOfficeTitles && (
          <CreateOfficeTitleButton />
        )}
      </div>

      {hasNoOfficeTitles ? (
        <PageEmptyState
          title="No office titles found"
          description="Adjust the current tab or add a new office title to get started."
          createUrl="/organizational-structure/office-title/new"
          createLabel="Create office title"
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Office Title Summary</CardTitle>
              <CardDescription>
                Overview of configured office title records and reusable
                sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Total Titles
                  </p>
                  <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                    <BriefcaseBusiness className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">
                  {countValue(totalOfficeTitles)}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Active
                  </p>
                  <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                    <UsersRound className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">
                  {countValue(activeOfficeTitles)}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Limited / Unlimited
                  </p>
                  <span className="rounded-md bg-violet-700/10 p-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300">
                    <Layers3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">
                  {hasQueryError
                    ? "-"
                    : `${limitedOfficeTitles} / ${unlimitedOfficeTitles}`}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Levels / Sections
                  </p>
                  <span className="rounded-md bg-violet-700/10 p-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300">
                    <Layers3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">
                  {hasQueryError ? "-" : `${uniqueLevels} / ${totalSections}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Office Title Directory</CardTitle>
                  <CardDescription>
                    Search, export, and maintain reusable office title
                    definitions.
                  </CardDescription>
                </div>
                <Tabs
                  value={statusTab}
                  onValueChange={(value) =>
                    setStatusTab(value as "ALL" | "ACTIVE" | "INACTIVE")
                  }
                >
                  <TabsList variant="line">
                    <TabsTrigger value="ALL">
                      All ({totalOfficeTitles})
                    </TabsTrigger>
                    <TabsTrigger value="ACTIVE">
                      Active ({activeOfficeTitles})
                    </TabsTrigger>
                    <TabsTrigger value="INACTIVE">
                      Inactive ({inactiveOfficeTitles})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {officeTitlesQuery.isLoading ? (
                <PageLoadingState mode="table" />
              ) : officeTitlesQuery.isError ? (
                <PageErrorState
                  title="Unable to load office titles"
                  description={
                    officeTitlesQuery.error instanceof Error
                      ? officeTitlesQuery.error.message
                      : "Office title records could not be loaded right now."
                  }
                  backUrl="/organizational-structure"
                  backLabel="Back to structure"
                />
              ) : filteredOfficeTitles.length === 0 ? (
                <PageEmptyState
                  title="No office titles found in this filter"
                  description="Try another tab or create a new office title to populate this view."
                  createUrl="/organizational-structure/office-title/new"
                  createLabel="Create office title"
                />
              ) : (
                <OfficeTitlesDataTable
                  data={filteredOfficeTitles}
                  onArchiveOfficeTitle={requestArchiveOfficeTitle}
                  onArchiveOfficeTitles={handleArchiveOfficeTitles}
                  onRetrieveOfficeTitle={handleRetrieveOfficeTitle}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={Boolean(archiveTargetId)}
        onOpenChange={(open) => {
          if (!open) setArchiveTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Archive this office title?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the office title from active use without deleting
              its record. You can retrieve it later anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArchiveTargetId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmArchiveOfficeTitle}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
