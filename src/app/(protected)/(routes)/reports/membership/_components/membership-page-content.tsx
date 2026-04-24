"use client";

import { useState } from "react";
import {
  Activity,
  Archive,
  BadgeCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMembershipReportQuery } from "@/features/members/member.hooks";
import {
  MembershipBranchPanel,
  MembershipAreaTrendChart,
  MembershipInsightPanel,
  MembershipLineTrendChart,
  MembershipMovementChart,
  MembershipOnboardingChart,
  MembershipStatusPieChart,
  MembershipStatusPanel,
  MembershipTypeChart,
} from "./membership-report-charts";

export function MembershipPageContent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [monthsToShow, setMonthsToShow] = useState("6");
  const membershipReportQuery = useMembershipReportQuery({
    months: Number.parseInt(monthsToShow, 10),
  });

  if (membershipReportQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <MembershipPageHeader />
        <PageLoadingState mode="table" />
      </section>
    );
  }

  if (membershipReportQuery.isError) {
    return (
      <section className="space-y-6 p-10">
        <MembershipPageHeader />
        <PageErrorState
          title="Unable to load membership analytics"
          description={
            membershipReportQuery.error instanceof Error
              ? membershipReportQuery.error.message
              : "Membership reporting data could not be loaded right now."
          }
          backUrl="/dashboard"
          backLabel="Back to dashboard"
        />
      </section>
    );
  }

  if (!membershipReportQuery.data?.summary.totalMembers) {
    return (
      <section className="space-y-6 p-10">
        <MembershipPageHeader />
        <PageEmptyState
          title="No membership data found"
          description="Add member records first to unlock movement charts, status analytics, and onboarding statistics."
          createUrl="/members/new"
          createLabel="Add new member"
        />
      </section>
    );
  }

  const report = membershipReportQuery.data;

  return (
    <section className="space-y-6 p-10">
      <MembershipPageHeader />

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Membership overview</CardTitle>
          <CardDescription>
            Live summary of roster size, intake velocity, approvals, and active
            onboarding volume.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryStatCard
            label="Total Records"
            value={report.summary.totalMembers.toLocaleString()}
            description="All membership records currently stored in the system"
            icon={<Users className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Active Roster"
            value={report.summary.activeMembers.toLocaleString()}
            description="Members who remain active in the roster"
            icon={<BadgeCheck className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Pending Review"
            value={report.summary.pendingMembers.toLocaleString()}
            description="Applications still waiting for approval"
            icon={<Activity className="size-4" />}
            accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
          <SummaryStatCard
            label="Approval Rate"
            value={`${report.summary.approvalRate}%`}
            description="Approved active members versus total stored records"
            icon={<TrendingUp className="size-4" />}
            accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryStatCard
            label="New This Month"
            value={report.summary.newThisMonth.toLocaleString()}
            description={formatGrowthDescription(
              report.summary.monthOverMonthGrowth,
            )}
            icon={<UserPlus className="size-4" />}
            accentClassName="bg-cyan-700/10 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-300"
          />
          <SummaryStatCard
            label="Archived"
            value={report.summary.archivedMembers.toLocaleString()}
            description={`${report.summary.onboardingMembers.toLocaleString()} active members currently tracked in onboarding`}
            icon={<Archive className="size-4" />}
            accentClassName="bg-slate-700/10 text-slate-700 dark:bg-slate-300/10 dark:text-slate-300"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <MembershipMovementChart data={report.trendData} />
        <MembershipStatusPanel data={report.statusBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MembershipLineTrendChart data={report.trendData} />
        <MembershipStatusPieChart data={report.statusBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1.3fr]">
        <MembershipAreaTrendChart data={report.trendData} />
        <MembershipBranchPanel data={report.branchBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <MembershipOnboardingChart data={report.onboardingBreakdown} />
        <MembershipTypeChart data={report.typeBreakdown} />
      </div>

      <MembershipInsightPanel data={report.insights} />
    </section>
  );
}

function MembershipPageHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        Membership Report
      </h1>
      <p className="text-muted-foreground text-sm">
        Track membership movement, roster composition, onboarding queues, and
        branch-of-service demand from live member records.
      </p>
    </div>
  );
}

function formatGrowthDescription(value: number) {
  if (value > 0) {
    return `${value} more than last month`;
  }

  if (value < 0) {
    return `${Math.abs(value)} fewer than last month`;
  }

  return "Same intake volume as last month";
}
