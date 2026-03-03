"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-react";

import { GlobalDataTable } from "@/components/global-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventRecord } from "./events-data";

type EventsDataTableProps = {
  data: EventRecord[];
  onDeleteEvents: (eventIds: string[]) => void;
};

export function EventsDataTable({ data, onDeleteEvents }: EventsDataTableProps) {
  const columns = useMemo<ColumnDef<EventRecord>[]>(
    () => [
      {
        accessorKey: "title",
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
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-muted-foreground text-xs">{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "organizer",
        header: "Organizer",
      },
      {
        accessorKey: "startsAt",
        header: "Schedule",
        cell: ({ row }) =>
          new Date(row.original.startsAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          if (row.original.status === "Scheduled") {
            return <Badge variant="secondary">Scheduled</Badge>;
          }
          if (row.original.status === "Ongoing") {
            return <Badge variant="warning">Ongoing</Badge>;
          }
          if (row.original.status === "Completed") {
            return <Badge variant="success">Completed</Badge>;
          }
          return <Badge variant="error">Cancelled</Badge>;
        },
      },
    ],
    []
  );

  return (
    <GlobalDataTable
      data={data}
      columns={columns}
      filterPlaceholder="Search event, category, organizer, location, or status..."
      emptyMessage="No events found."
      exportFileName="events"
      onDeleteSelected={(rows) => onDeleteEvents(rows.map((row) => row.id))}
    />
  );
}
