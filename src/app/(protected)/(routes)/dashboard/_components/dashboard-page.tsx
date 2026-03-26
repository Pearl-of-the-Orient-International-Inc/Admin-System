"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";

import { DashboardCalendarCard } from "./dashboard-calendar-card";
import { DashboardCharts } from "./dashboard-charts";
import {
  dashboardActivityFeed,
  dashboardDeadlines,
  dashboardHealthCards,
  dashboardLatestMemo,
  dashboardSchedulesByDate,
  dashboardStats,
  dashboardUpcomingEvents,
} from "./dashboard-data";
import { DashboardHeader } from "./dashboard-header";
import { DashboardLatestMemo } from "./dashboard-latest-memo";
import { DashboardOperationsFeed } from "./dashboard-operations-feed";
import { DashboardStatsGrid } from "./dashboard-stats-grid";
import { DashboardUpcomingEvents } from "./dashboard-upcoming-events";

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date("2026-03-26"),
  );

  const allSchedules = useMemo(
    () => Object.values(dashboardSchedulesByDate).flat(),
    [],
  );

  return (
    <section className="space-y-6 p-10">
      <DashboardHeader />
      <DashboardStatsGrid items={dashboardStats} />

      <div className="grid gap-6 lg:grid-cols-5">
        <DashboardCharts />
        <DashboardCalendarCard
          events={allSchedules}
          deadlines={dashboardDeadlines}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date ?? selectedDate)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <DashboardUpcomingEvents items={dashboardUpcomingEvents} />
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
