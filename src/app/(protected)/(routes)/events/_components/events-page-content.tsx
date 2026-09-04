"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { SummaryStatCard } from "@/components/SummaryStatCard";

type EventSummaryFilter =
  | "ALL"
  | EventStatus.SCHEDULED
  | EventStatus.ONGOING
  | EventStatus.COMPLETED
  | EventStatus.CANCELLED;

export function EventsPageContent() {
  const { toast } = useToast();
  const [summaryFilter, setSummaryFilter] =
    useState<EventSummaryFilter>("ALL");
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
  const [deleteTargetEvent, setDeleteTargetEvent] =
    useState<EventRecord | null>(null);

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
  const filteredEvents = useMemo(() => {
    if (summaryFilter === "ALL") {
      return events;
    }

    return events.filter((event) => resolveEventStatus(event) === summaryFilter);
  }, [events, summaryFilter]);

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

  const requestDeleteEvent = (event: EventRecord) => {
    setDeleteTargetEvent(event);
  };

  const handleDeleteEvent = async () => {
    if (!deleteTargetEvent) return;

    try {
      await deleteEventMutation.mutateAsync(deleteTargetEvent.id);
      if (selectedEvent?.id === deleteTargetEvent.id) {
        setSelectedEvent(null);
        setIsDetailsOpen(false);
      }
      toast({
        title: "Event deleted",
        description: `${deleteTargetEvent.name} was removed successfully.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Unable to delete this event right now.",
        variant: "error",
      });
    } finally {
      setDeleteTargetEvent(null);
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
              <SummaryStatCard
                label="Total Events"
                value={totalEvents}
                description="All event records"
                icon={<ListChecks className="size-4" />}
                accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
                active={summaryFilter === "ALL"}
                onClick={() => setSummaryFilter("ALL")}
              />
              <SummaryStatCard
                label="Scheduled"
                value={scheduledEvents}
                description="Queued for upcoming dates"
                icon={<CalendarCheck2 className="size-4" />}
                accentClassName="bg-indigo-700/10 text-indigo-700 dark:bg-indigo-300/10 dark:text-indigo-300"
                active={summaryFilter === EventStatus.SCHEDULED}
                onClick={() => setSummaryFilter(EventStatus.SCHEDULED)}
              />
              <SummaryStatCard
                label="Ongoing"
                value={ongoingEvents}
                description="Currently in progress"
                icon={<Clock3 className="size-4" />}
                accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
                active={summaryFilter === EventStatus.ONGOING}
                onClick={() => setSummaryFilter(EventStatus.ONGOING)}
              />
              <SummaryStatCard
                label="Completed"
                value={completedEvents}
                description="Finished events"
                icon={<CalendarCheck2 className="size-4" />}
                accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
                active={summaryFilter === EventStatus.COMPLETED}
                onClick={() => setSummaryFilter(EventStatus.COMPLETED)}
              />
              <SummaryStatCard
                label="Cancelled"
                value={cancelledEvents}
                description="Cancelled or postponed"
                icon={<XCircle className="size-4" />}
                accentClassName="bg-rose-700/10 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300"
                active={summaryFilter === EventStatus.CANCELLED}
                onClick={() => setSummaryFilter(EventStatus.CANCELLED)}
              />
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
                      data={filteredEvents}
                      onDeleteEvents={handleDeleteEvents}
                      onViewEvent={handleViewEvent}
                      onCancelEvent={handleCancelEvent}
                      onDeleteEvent={requestDeleteEvent}
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
                      data={filteredEvents}
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

      <AlertDialog
        open={Boolean(deleteTargetEvent)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetEvent(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTargetEvent?.name ?? "this event"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTargetEvent(null)}
              disabled={deleteEventMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleDeleteEvent()}
              disabled={deleteEventMutation.isPending}
            >
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
