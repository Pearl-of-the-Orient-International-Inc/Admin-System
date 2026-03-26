"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { EventStatus } from "@/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getEventStatusLabel,
  getEventTypeLabel,
  resolveEventStatus,
  type EventRecord,
} from "./events-data";
import { EventActionsMenu } from "./event-actions-menu";

type EventsDataTableProps = {
  data: EventRecord[];
  onDeleteEvents: (eventIds: string[]) => void;
  onViewEvent: (event: EventRecord) => void;
  onCancelEvent: (event: EventRecord) => void;
};

export function EventsDataTable({
  data,
  onDeleteEvents,
  onViewEvent,
  onCancelEvent,
}: EventsDataTableProps) {
  const columns = useMemo<ColumnDef<EventRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Event
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-75">
            <p className="font-medium line-clamp-1">{row.original.name}</p>
            <p className="text-muted-foreground text-xs">ID: {row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => getEventTypeLabel(row.original.type),
      },
      {
        accessorKey: "organizer",
        header: "Organizer",
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => row.original.location ?? "Online",
      },
      {
        accessorKey: "startsAt",
        header: "Start Date",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <p>
              {new Date(row.original.startsAt).toLocaleString("en-US", {
                year: "numeric",
                day: "numeric",
                month: "short",
              })}
            </p>
            <span className="text-sm text-muted-foreground">
              {new Date(row.original.startsAt).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = resolveEventStatus(row.original);

          if (status === EventStatus.SCHEDULED) {
            return <Badge variant="info">{getEventStatusLabel(status)}</Badge>;
          }
          if (status === EventStatus.ONGOING) {
            return (
              <Badge variant="warning">{getEventStatusLabel(status)}</Badge>
            );
          }
          if (status === EventStatus.COMPLETED) {
            return (
              <Badge variant="success">{getEventStatusLabel(status)}</Badge>
            );
          }
          return <Badge variant="error">{getEventStatusLabel(status)}</Badge>;
        },
      },
    ],
    [],
  );

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search event, category, type, organizer, visibility, or status..."
      emptyMessage="No events found."
      exportFileName="events"
      onDeleteSelected={(rows) => onDeleteEvents(rows.map((row) => row.id))}
      cellAction={(row) => (
        <EventActionsMenu
          event={row.original}
          onViewEvent={onViewEvent}
          onCancelEvent={onCancelEvent}
        />
      )}
    />
  );
}
