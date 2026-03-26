"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck2,
  Clock3,
  ListChecks,
  Plus,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStatus } from "@/enums";
import { useToast } from "@/hooks/use-toast";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import {
  useCancelEventMutation,
  useDeleteEventMutation,
  useEventsQuery,
} from "@/features/events/event.hooks";
import { EventsCalendarView } from "./events-calendar-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventDetailsSheet } from "./event-details-sheet";
import { EventsDataTable } from "./events-data-table";
import { resolveEventStatus, type EventRecord } from "./events-data";

export function EventsPageContent() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useEventsQuery({
    limit: 100,
    sortBy: "startsAt",
    sortOrder: "desc",
  });
  const deleteEventMutation = useDeleteEventMutation();
  const cancelEventMutation = useCancelEventMutation();
  const events = useMemo(() => data?.items ?? [], [data?.items]);
  const hasNoEvents = !isLoading && !isError && events.length === 0;
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const totalEvents = events.length;
  const scheduledEvents = useMemo(
    () =>
      events.filter(
        (event) => resolveEventStatus(event) === EventStatus.SCHEDULED,
      ).length,
    [events],
  );
  const ongoingEvents = useMemo(
    () =>
      events.filter(
        (event) => resolveEventStatus(event) === EventStatus.ONGOING,
      ).length,
    [events],
  );
  const completedEvents = useMemo(
    () =>
      events.filter(
        (event) => resolveEventStatus(event) === EventStatus.COMPLETED,
      ).length,
    [events],
  );
  const cancelledEvents = useMemo(
    () =>
      events.filter(
        (event) => resolveEventStatus(event) === EventStatus.CANCELLED,
      ).length,
    [events],
  );

  const handleDeleteEvents = async (eventIds: string[]) => {
    try {
      await Promise.all(
        eventIds.map((eventId) => deleteEventMutation.mutateAsync(eventId)),
      );
      toast({
        title: "Events deleted",
        description:
          eventIds.length === 1
            ? "The event was removed successfully."
            : `${eventIds.length} events were removed successfully.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Unable to delete the selected events right now.",
        variant: "error",
      });
    }
  };

  const handleViewEvent = (event: EventRecord) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleCancelEvent = async (event: EventRecord) => {
    try {
      const updatedEvent = await cancelEventMutation.mutateAsync(event.id);
      setSelectedEvent(updatedEvent);
      toast({
        title: "Event cancelled",
        description: `${event.name} has been marked as cancelled.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Cancel failed",
        description: "Unable to cancel this event right now.",
        variant: "error",
      });
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground text-sm">
            Manage upcoming and completed church events in one directory.
          </p>
        </div>

        {!hasNoEvents && (
          <Button asChild>
            <Link href="/events/new">
              <Plus className="size-4" />
              Add new event
            </Link>
          </Button>
        )}
      </div>

      {hasNoEvents ? (
        <PageEmptyState
          title="No events found"
          description="Create your first event to start building your events directory and calendar."
          createUrl="/events/new"
          createLabel="Create event"
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Event Summary</CardTitle>
              <CardDescription>
                Current schedule distribution across all events.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Total Events
                  </p>
                  <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                    <ListChecks className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{totalEvents}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  All event records
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Scheduled
                  </p>
                  <span className="rounded-md bg-indigo-700/10 p-1.5 text-indigo-700 dark:bg-indigo-300/10 dark:text-indigo-300">
                    <CalendarCheck2 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{scheduledEvents}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Queued for upcoming dates
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Ongoing
                  </p>
                  <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                    <Clock3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{ongoingEvents}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Currently in progress
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Completed
                  </p>
                  <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                    <CalendarCheck2 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{completedEvents}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Finished events
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Cancelled
                  </p>
                  <span className="rounded-md bg-rose-700/10 p-1.5 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300">
                    <XCircle className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{cancelledEvents}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Cancelled or postponed
                </p>
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
                    Search, sort, and maintain all event records with batch
                    actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <PageLoadingState mode="table" />
                  ) : isError ? (
                    <PageErrorState
                      title="Unable to load events"
                      description={
                        error instanceof Error
                          ? error.message
                          : "Event records could not be loaded right now."
                      }
                      backUrl="/dashboard"
                      backLabel="Back to dashboard"
                    />
                  ) : (
                    <EventsDataTable
                      data={events}
                      onDeleteEvents={handleDeleteEvents}
                      onViewEvent={handleViewEvent}
                      onCancelEvent={handleCancelEvent}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card className="bg-transparent">
                <CardHeader className="border-b pb-4">
                  <CardTitle>Event Calendar</CardTitle>
                  <CardDescription>
                    View scheduled events in monthly, weekly, and daily calendar
                    layouts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <PageLoadingState mode="calendar" />
                  ) : isError ? (
                    <PageErrorState
                      title="Unable to load calendar"
                      description={
                        error instanceof Error
                          ? error.message
                          : "The event calendar could not be loaded right now."
                      }
                      backUrl="/dashboard"
                      backLabel="Back to dashboard"
                    />
                  ) : (
                    <EventsCalendarView
                      data={events}
                      onViewEvent={handleViewEvent}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <EventDetailsSheet
        event={selectedEvent}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onCancelEvent={handleCancelEvent}
      />
    </section>
  );
}
