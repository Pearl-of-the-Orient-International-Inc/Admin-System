"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { useTheme } from "next-themes";
import {
  getEventCategoryLabel,
  getEventStatusLabel,
  getEventTypeLabel,
  resolveEventStatus,
  type EventRecord,
} from "./events-data";

type EventsCalendarViewProps = {
  data: EventRecord[];
  onViewEvent: (event: EventRecord) => void;
};

export function EventsCalendarView({
  data,
  onViewEvent,
}: EventsCalendarViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const statusColorMap: Record<EventRecord["status"], string> = useMemo(
    () => ({
      SCHEDULED: isDark ? "#818cf8" : "#4f46e5",
      ONGOING: isDark ? "#f59e0b" : "#d97706",
      COMPLETED: isDark ? "#34d399" : "#15803d",
      CANCELLED: isDark ? "#fb7185" : "#b91c1c",
    }),
    [isDark]
  );

  const calendarEvents = useMemo(
    () =>
      data.map((event) => {
        const status = resolveEventStatus(event);

        return {
          id: event.id,
          title: event.name,
          start: event.startsAt,
          end: event.endsAt,
          backgroundColor: statusColorMap[status],
          borderColor: statusColorMap[status],
          extendedProps: {
            category: getEventCategoryLabel(event.category),
            type: getEventTypeLabel(event.type),
            organizer: event.organizer,
            status: getEventStatusLabel(status),
          },
        };
      }),
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
          const selectedEvent = data.find((event) => event.id === info.event.id);
          if (selectedEvent) {
            onViewEvent(selectedEvent);
          }
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
