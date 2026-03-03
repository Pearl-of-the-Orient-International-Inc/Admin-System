"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { useTheme } from "next-themes";
import type { EventRecord } from "./events-data";

type EventsCalendarViewProps = {
  data: EventRecord[];
};

export function EventsCalendarView({ data }: EventsCalendarViewProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const statusColorMap: Record<EventRecord["status"], string> = useMemo(
    () => ({
      Scheduled: isDark ? "#818cf8" : "#4f46e5",
      Ongoing: isDark ? "#f59e0b" : "#d97706",
      Completed: isDark ? "#34d399" : "#15803d",
      Cancelled: isDark ? "#fb7185" : "#b91c1c",
    }),
    [isDark]
  );

  const calendarEvents = useMemo(
    () =>
      data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startsAt,
        backgroundColor: statusColorMap[event.status],
        borderColor: statusColorMap[event.status],
        extendedProps: {
          category: event.category,
          location: event.location,
          organizer: event.organizer,
          status: event.status,
        },
      })),
    [data, statusColorMap]
  );

  return (
    <div className="events-calendar rounded-lg border bg-card p-4">
      <FullCalendar
        key={isDark ? "calendar-dark" : "calendar-light"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
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
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          router.push(`/events/${info.event.id}`);
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        height="auto"
      />
    </div>
  );
}
