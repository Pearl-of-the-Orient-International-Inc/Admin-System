"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarClock, UserRoundPlus, Users } from "lucide-react";

import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { useDashboardReportQuery } from "@/features/reports/report.hooks";
import { DashboardCalendarCard } from "./dashboard-calendar-card";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardLocationAnalytics } from "./dashboard-location-analytics";
import {
  dashboardActivityFeed,
  dashboardDeadlines,
  dashboardHealthCards,
  dashboardLatestMemo,
} from "./dashboard-data";
import { DashboardHeader } from "./dashboard-header";
import { DashboardLatestMemo } from "./dashboard-latest-memo";
import { DashboardOperationsFeed } from "./dashboard-operations-feed";
import { DashboardStatsGrid } from "./dashboard-stats-grid";

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dashboardReportQuery = useDashboardReportQuery({ months: 6 });

  const allSchedules = useMemo(
    () => dashboardReportQuery.data?.calendarEvents ?? [],
    [dashboardReportQuery.data?.calendarEvents],
  );

  const dashboardStats = useMemo(() => {
    const summary = dashboardReportQuery.data?.summary;

    if (!summary) {
      return [];
    }

    return [
      {
        title: "Total Members",
        value: summary.totalMembers.toLocaleString(),
        change: `${summary.approvedMembers.toLocaleString()} approved roster`,
        description: "Approved and active records across the ministry roster.",
        tone: "bg-sky-700/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-300",
        icon: Users,
      },
      {
        title: "Pending Applications",
        value: summary.pendingApplications.toLocaleString(),
        change: `${summary.urgentPendingApplications.toLocaleString()} waiting over 7 days`,
        description: "Applicants waiting for review before endorsement.",
        tone: "bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300",
        icon: UserRoundPlus,
      },
      {
        title: "This Week's Events",
        value: summary.thisWeeksEvents.toLocaleString(),
        change: `${summary.onlineEventsThisWeek.toLocaleString()} online`,
        description: "Formation, worship, and outreach events on the calendar.",
        tone: "bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300",
        icon: CalendarClock,
      },
    ];
  }, [dashboardReportQuery.data?.summary]);

  if (dashboardReportQuery.isLoading) {
    return (
      <section className="mx-auto w-full max-w-full min-w-0 space-y-6 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <DashboardHeader />
        <PageLoadingState mode="grid" />
      </section>
    );
  }

  if (dashboardReportQuery.isError || !dashboardReportQuery.data) {
    return (
      <section className="mx-auto w-full max-w-full min-w-0 space-y-6 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <DashboardHeader />
        <PageErrorState
          title="Unable to load dashboard analytics"
          description={
            dashboardReportQuery.error instanceof Error
              ? dashboardReportQuery.error.message
              : "Dashboard reporting data could not be loaded right now."
          }
          backUrl="/reports/membership"
          backLabel="Open membership report"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-full min-w-0 space-y-6 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <DashboardHeader />
      <DashboardStatsGrid items={dashboardStats} />

      <DashboardCalendarCard
        events={allSchedules}
        deadlines={dashboardDeadlines}
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date ?? selectedDate)}
      />

      <DashboardCharts
        trendData={dashboardReportQuery.data.membershipTrend}
        onboardingData={dashboardReportQuery.data.onboardingBreakdown}
      />

      <DashboardLocationAnalytics />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <DashboardLatestMemo memo={dashboardLatestMemo} />
      </div>
      <DashboardOperationsFeed
        activities={dashboardActivityFeed}
        healthCards={dashboardHealthCards}
        focusWindow={`Next checkpoint: ${format(addDays(selectedDate, 1), "MMMM d")}`}
      />
    </section>
  );
}
