"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DashboardDeadline,
  DashboardScheduleItem,
} from "./dashboard-data";

type DashboardCalendarCardProps = {
  events: DashboardScheduleItem[];
  deadlines: DashboardDeadline[];
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
};

export function DashboardCalendarCard({
  events,
  deadlines,
  selectedDate,
  onSelectDate,
}: DashboardCalendarCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const statusColorMap: Record<DashboardScheduleItem["status"], string> =
    useMemo(
      () => ({
        SCHEDULED: isDark ? "#818cf8" : "#4f46e5",
        ONGOING: isDark ? "#f59e0b" : "#d97706",
        COMPLETED: isDark ? "#34d399" : "#15803d",
        CANCELLED: isDark ? "#fb7185" : "#b91c1c",
      }),
      [isDark],
    );

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startsAt,
        end: event.endsAt,
        backgroundColor: statusColorMap[event.status],
        borderColor: statusColorMap[event.status],
      })),
    [events, statusColorMap],
  );

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="border-b">
        <CardTitle>Calendar and daily schedule</CardTitle>
        <CardDescription>
          Review the day&apos;s ministry schedule, interview blocks, and office
          deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-3">
        <div className="events-calendar">
          <FullCalendar
            key={
              isDark ? "dashboard-calendar-dark" : "dashboard-calendar-light"
            }
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={selectedDate}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            events={calendarEvents}
            dateClick={(info) => onSelectDate(new Date(info.dateStr))}
            eventClick={(info) => onSelectDate(info.event.start ?? undefined)}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            height="auto"
          />
        </div>

        <div className="rounded-xl border bg-primary/3 p-4">
          <p className="text-sm font-medium">Upcoming deadlines</p>
          <div className="mt-3 space-y-5">
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium">{deadline.label}</p>
                  <p className="text-muted-foreground">{deadline.owner}</p>
                </div>
                <p className="whitespace-nowrap text-muted-foreground">
                  {deadline.due}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
