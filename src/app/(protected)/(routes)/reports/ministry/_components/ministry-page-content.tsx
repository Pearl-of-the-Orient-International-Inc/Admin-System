"use client";

import { useState } from "react";
import {
  Activity,
  CalendarClock,
  Landmark,
  Network,
  RadioTower,
  ShieldCheck,
  ShieldX,
  UserRoundCog,
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
import { useMinistryReportQuery } from "@/features/reports/report.hooks";
import {
  MinistryActivityTrendChart,
  MinistryBranchPanel,
  MinistryCategoryChart,
  MinistryCompletionChart,
  MinistryInsightPanel,
  MinistryLeadershipChart,
  MinistryStatusPanel,
  MinistryUpcomingPanel,
} from "./ministry-report-charts";

export function MinistryPageContent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [monthsToShow, setMonthsToShow] = useState("6");
  const ministryReportQuery = useMinistryReportQuery({
    months: Number.parseInt(monthsToShow, 10),
  });

  if (ministryReportQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <MinistryPageHeader />
        <PageLoadingState mode="grid" />
      </section>
    );
  }

  if (ministryReportQuery.isError) {
    return (
      <section className="space-y-6 p-10">
        <MinistryPageHeader />
        <PageErrorState
          title="Unable to load ministry analytics"
          description={
            ministryReportQuery.error instanceof Error
              ? ministryReportQuery.error.message
              : "Ministry reporting data could not be loaded right now."
          }
          backUrl="/dashboard"
          backLabel="Back to dashboard"
        />
      </section>
    );
  }

  if (
    !ministryReportQuery.data?.summary.totalEvents &&
    !ministryReportQuery.data?.summary.activeBranches &&
    !ministryReportQuery.data?.summary.filledLeadershipSlots
  ) {
    return (
      <section className="space-y-6 p-10">
        <MinistryPageHeader />
        <PageEmptyState
          title="No ministry data found"
          description="Create branch services, office titles, or ministry events first to unlock activity reporting and leadership coverage analytics."
          createUrl="/events"
          createLabel="Manage events"
        />
      </section>
    );
  }

  const report = ministryReportQuery.data;

  if (!report) {
    return null;
  }

  return (
    <section className="space-y-6 p-10">
      <MinistryPageHeader />

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Ministry overview</CardTitle>
          <CardDescription>
            A live operational read of event volume, branch utilization, and
            leadership coverage across the ministry workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="Total Events"
            value={report.summary.totalEvents.toLocaleString()}
            description="All ministry activities currently stored in the calendar"
            icon={<Activity className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Upcoming"
            value={report.summary.upcomingEvents.toLocaleString()}
            description="Scheduled ministry events that are still ahead on the calendar"
            icon={<CalendarClock className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Active Branches"
            value={report.summary.activeBranches.toLocaleString()}
            description={`${report.summary.branchCoverageRate}% of branch services currently have member alignment`}
            icon={<Landmark className="size-4" />}
            accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
          <SummaryStatCard
            label="Online Share"
            value={`${report.summary.onlineShare}%`}
            description="Portion of ministry events running in digital channels"
            icon={<RadioTower className="size-4" />}
            accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryStatCard
            label="Filled Leadership"
            value={report.summary.filledLeadershipSlots.toLocaleString()}
            description="Active ministry leadership assignments across configured office titles"
            icon={<UserRoundCog className="size-4" />}
            accentClassName="bg-cyan-700/10 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-300"
          />
          <SummaryStatCard
            label="Coverage Rate"
            value={`${report.summary.leadershipCoverageRate}%`}
            description="Configured leadership capacity currently filled by active assignments"
            icon={<ShieldCheck className="size-4" />}
            accentClassName="bg-teal-700/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-300"
          />
          <SummaryStatCard
            label="Open Slots"
            value={report.summary.openLeadershipSlots.toLocaleString()}
            description="Configured ministry leadership positions still awaiting placement"
            icon={<ShieldX className="size-4" />}
            accentClassName="bg-rose-700/10 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300"
          />
          <SummaryStatCard
            label="Branch Reach"
            value={`${report.summary.branchCoverageRate}%`}
            description="Branch services with at least one aligned member"
            icon={<Network className="size-4" />}
            accentClassName="bg-slate-700/10 text-slate-700 dark:bg-slate-300/10 dark:text-slate-300"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <MinistryActivityTrendChart data={report.trendData} />
        <MinistryStatusPanel data={report.statusBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MinistryCompletionChart data={report.trendData} />
        <MinistryCategoryChart data={report.categoryBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <MinistryBranchPanel data={report.branchBreakdown} />
        <MinistryLeadershipChart data={report.leadershipBreakdown} />
      </div>

      <MinistryUpcomingPanel data={report.upcomingEvents} />
      <MinistryInsightPanel data={report.insights} />
    </section>
  );
}

function MinistryPageHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        Ministry Activity Report
      </h1>
      <p className="text-muted-foreground text-sm">
        Monitor live ministry operations through event volume, branch service
        uptake, and leadership coverage signals.
      </p>
    </div>
  );
}
