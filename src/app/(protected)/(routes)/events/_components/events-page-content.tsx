"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Clock3, ListChecks, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsCalendarView } from "./events-calendar-view";
import { eventRecords, type EventRecord } from "./events-data";
import { EventsDataTable } from "./events-data-table";

export function EventsPageContent() {
  const [events, setEvents] = useState<EventRecord[]>(eventRecords);

  const totalEvents = events.length;
  const scheduledEvents = useMemo(
    () => events.filter((event) => event.status === "Scheduled").length,
    [events]
  );
  const ongoingEvents = useMemo(
    () => events.filter((event) => event.status === "Ongoing").length,
    [events]
  );
  const completedEvents = useMemo(
    () => events.filter((event) => event.status === "Completed").length,
    [events]
  );
  const cancelledEvents = useMemo(
    () => events.filter((event) => event.status === "Cancelled").length,
    [events]
  );

  const handleDeleteEvents = (eventIds: string[]) => {
    const ids = new Set(eventIds);
    setEvents((current) => current.filter((event) => !ids.has(event.id)));
  };

  return (
    <section className="space-y-6 p-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground text-sm">
          Manage upcoming and completed church events in one directory.
        </p>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle>Event Summary</CardTitle>
          <CardDescription>Current schedule distribution across all events.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Total Events</p>
              <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                <ListChecks className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{totalEvents}</p>
            <p className="text-muted-foreground mt-1 text-xs">All event records</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Scheduled</p>
              <span className="rounded-md bg-indigo-700/10 p-1.5 text-indigo-700 dark:bg-indigo-300/10 dark:text-indigo-300">
                <CalendarCheck2 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{scheduledEvents}</p>
            <p className="text-muted-foreground mt-1 text-xs">Queued for upcoming dates</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Ongoing</p>
              <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                <Clock3 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{ongoingEvents}</p>
            <p className="text-muted-foreground mt-1 text-xs">Currently in progress</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Completed</p>
              <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                <CalendarCheck2 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{completedEvents}</p>
            <p className="text-muted-foreground mt-1 text-xs">Finished events</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Cancelled</p>
              <span className="rounded-md bg-rose-700/10 p-1.5 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300">
                <XCircle className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{cancelledEvents}</p>
            <p className="text-muted-foreground mt-1 text-xs">Cancelled or postponed</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Event Directory</CardTitle>
              <CardDescription>
                Search, sort, and maintain all event records with batch actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsDataTable data={events} onDeleteEvents={handleDeleteEvents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>
                View scheduled events in monthly, weekly, and daily calendar layouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsCalendarView data={events} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
