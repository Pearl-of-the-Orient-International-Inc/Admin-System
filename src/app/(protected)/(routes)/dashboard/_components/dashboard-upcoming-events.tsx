"use client";

import { format } from "date-fns";
import { CalendarDays, MapPin, Users2, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getEventCategoryLabel,
  getEventTypeLabel,
} from "../../events/_components/events-data";
import type { DashboardUpcomingEvent } from "./dashboard-data";

export function DashboardUpcomingEvents({
  items,
}: {
  items: DashboardUpcomingEvent[];
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-card/95 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle>Upcoming events</CardTitle>
        <CardDescription>
          Scheduled worship, formation, outreach, and chaplaincy ministry
          commitments.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid h-100 gap-3 overflow-y-auto pt-6 no-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(247,249,246,0.92))] p-4 transition-colors hover:border-primary/35"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="line-clamp-2 text-[15px] font-medium leading-6">
                  {item.title}
                </p>
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {getEventCategoryLabel(item.category)}
              </Badge>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0" />
                <span>{format(new Date(item.startsAt), "MMM d, h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.type === "ONLINE" ? (
                  <Video className="size-4 shrink-0" />
                ) : (
                  <MapPin className="size-4 shrink-0" />
                )}
                <span className="truncate">
                  {getEventTypeLabel(item.type)} | {item.location}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Users2 className="size-4 shrink-0" />
                <span>{item.attendees} expected attendees</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
