"use client";

import { ActivityLogPage } from "@/app/(protected)/(routes)/system-logs/_components/activity-log-page";
import { PageLoadingState } from "@/components/PageLoadingState";
import { useAccountByIdQuery } from "@/features/accounts/account.hooks";
import { useUserActivityLogsQuery } from "@/features/system-logs/system-log.hooks";

export function AccountActivityPageContent({
  accountId,
}: {
  accountId: string;
}) {
  const accountQuery = useAccountByIdQuery(accountId);
  const activityLogsQuery = useUserActivityLogsQuery(
    accountId,
    Boolean(accountQuery.data),
  );

  if (accountQuery.isLoading || activityLogsQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <PageLoadingState mode="table" />
      </section>
    );
  }

  if (accountQuery.isError) {
    return (
      <ActivityLogPage
        title="Account Activity"
        description="Review the actions performed by this administrator."
        logs={[]}
        emptyTitle=""
        emptyDescription=""
        createUrl="/accounts"
        createLabel="Back to accounts"
        backUrl="/accounts"
        backLabel="Back to accounts"
        errorTitle="Unable to load account activity"
        errorDescription={
          accountQuery.error instanceof Error
            ? accountQuery.error.message
            : "This account activity view could not be loaded right now."
        }
      />
    );
  }

  if (!accountQuery.data) {
    return (
      <ActivityLogPage
        title="Account Activity"
        description="Review the actions performed by this administrator."
        logs={[]}
        emptyTitle=""
        emptyDescription=""
        createUrl="/accounts"
        createLabel="Back to accounts"
        backUrl="/accounts"
        backLabel="Back to accounts"
        errorTitle="Account not found"
        errorDescription="The requested admin account could not be found."
      />
    );
  }

  return (
    <ActivityLogPage
      title={`${accountQuery.data.name} Activity`}
      description={`Review the recorded actions performed by ${accountQuery.data.email}.`}
      logs={activityLogsQuery.data ?? []}
      emptyTitle="No activity found for this account"
      emptyDescription="This administrator does not have any recorded activity yet."
      createUrl="/accounts"
      createLabel="Back to accounts"
      backUrl="/accounts"
      backLabel="Back to accounts"
      errorTitle={
        activityLogsQuery.isError ? "Unable to load account activity" : undefined
      }
      errorDescription={
        activityLogsQuery.isError
          ? activityLogsQuery.error instanceof Error
            ? activityLogsQuery.error.message
            : "This account activity view could not be loaded right now."
          : undefined
      }
    />
  );
}
