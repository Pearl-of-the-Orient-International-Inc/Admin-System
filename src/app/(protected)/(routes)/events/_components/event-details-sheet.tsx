/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Globe2,
  Link2,
  MapPin,
  ShieldCheck,
  Tag,
  Video,
  X,
} from "lucide-react";

import { EventStatus, EventType, EventVisibility } from "@/enums";
import {
  useEventAttendeesQuery,
  useReviewEventAttendeeMutation,
} from "@/features/events/event.hooks";
import type { ReviewEventAttendeeStatus } from "@/features/events/event.types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getEventCategoryLabel,
  getEventMeetingPlatformLabel,
  getEventStatusLabel,
  getEventVisibilityLabel,
  resolveEventStatus,
  type EventRecord,
} from "./events-data";
import { EventActionsMenu } from "./event-actions-menu";
import { AnimatedTooltip } from "@/components/kibo-ui/AnimatedTooltip";
import { EventInviteAttendeesDialog } from "./event-invite-attendees-dialog";

type EventDetailsSheetProps = {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelEvent?: (event: EventRecord) => void;
};

const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));

const formatMonth = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(value));

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
  }).format(new Date(value));

const formatTimeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getLocationLabel = (event: EventRecord) => {
  if (event.type === EventType.ONLINE) {
    return (
      getEventMeetingPlatformLabel(event.meetingPlatform) || "Online Event"
    );
  }

  return event.location || "Location will be announced";
};

const getLocationSubLabel = (event: EventRecord) => {
  if (event.type === EventType.ONLINE) {
    return event.onlineLink || "Virtual meeting link will be shared.";
  }

  return event.location || "No physical address provided.";
};

const getMapEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

const getMapsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

export function EventDetailsSheet({
  event,
  open,
  onOpenChange,
  onCancelEvent,
}: EventDetailsSheetProps) {
  const { toast } = useToast();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const status = useMemo(
    () => (event ? resolveEventStatus(event) : EventStatus.SCHEDULED),
    [event],
  );
  const attendeesQuery = useEventAttendeesQuery(event?.id ?? "", open && Boolean(event));
  const reviewAttendeeMutation = useReviewEventAttendeeMutation();
  const attendeeTooltipItems = useMemo(
    () =>
      (attendeesQuery.data ?? []).slice(0, 6).map((attendee, index) => ({
        id: index + 1,
        name: attendee.member.fullName,
        designation: attendee.member.email,
        image: attendee.member.avatar || "/main/logo.png",
      })),
    [attendeesQuery.data],
  );
  const attendeeCount = attendeesQuery.data?.length ?? 0;
  const attendeeSummary = (attendeesQuery.data ?? [])
    .slice(0, 2)
    .map((attendee) => attendee.member.fullName)
    .join(", ");
  const pendingAttendees = (attendeesQuery.data ?? []).filter(
    (attendee) => attendee.inviteStatus === "PENDING_APPROVAL",
  );
  const approvedAttendees = (attendeesQuery.data ?? []).filter(
    (attendee) => attendee.inviteStatus === "APPROVED",
  );
  const attendedCount = (attendeesQuery.data ?? []).filter(
    (attendee) => attendee.inviteStatus === "ATTENDED",
  ).length;

  const handleReviewAttendee = async (
    attendeeId: string,
    nextStatus: ReviewEventAttendeeStatus,
  ) => {
    if (!event) return;
    try {
      await reviewAttendeeMutation.mutateAsync({
        eventId: event.id,
        attendeeId,
        status: nextStatus,
      });
      toast({
        title: "Registration updated",
        description:
          nextStatus === "APPROVED"
            ? "The member can now officially join this event."
            : nextStatus === "REJECTED"
              ? "The registration request was declined."
              : "Attendance is confirmed and this member is certificate-eligible.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Unable to update registration",
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
        variant: "error",
      });
    }
  };

  const handleCopyLink = async () => {
    if (!event) return;

    try {
      const websiteOrigin =
        process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ??
        window.location.origin;
      const url = `${websiteOrigin}/events/${event.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The event link has been copied to your clipboard.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy the event link right now.",
        variant: "error",
      });
    }
  };

  if (!event) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          showCloseButton={false}
          side="right"
          className="w-full gap-0 border-l bg-background p-0 sm:max-w-2xl"
        />
      </Sheet>
    );
  }

  const mapQuery = event.location || event.organizer;
  const showMap = event.type === EventType.ONSITE && Boolean(event.location);
  const websiteOrigin = process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
  const publicEventHref = `${websiteOrigin ?? ""}/events/${event.id}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        side="right"
        className="w-full gap-0 border-l bg-[hsl(var(--background))] p-0 max-w-xl!"
      >
        <div className="flex h-full flex-col bg-background">
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm">
                    <ChevronRight className="size-4 rotate-180" />
                  </Button>
                </SheetClose>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="rounded-xl bg-card"
                >
                  <Copy className="size-4" />
                  Copy Link
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-card"
                >
                  <Link href={publicEventHref}>
                    Event Page
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <EventActionsMenu
                event={event}
                onCancelEvent={onCancelEvent}
                align="end"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <SheetHeader className="sr-only">
              <SheetTitle>{event.name}</SheetTitle>
              <SheetDescription>Event details preview sheet</SheetDescription>
            </SheetHeader>

            <div className="space-y-7">
              <div className="aspect-video">
                <img
                  src={event.thumbnailUrl}
                  alt={event.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {event.name}
                  </h2>
                  <div className="flex items-center gap-2 text-base text-muted-foreground">
                    <img alt="Pearl" src="/main/logo.png" className="size-5" />
                    <span>
                      Hosted by{" "}
                      <span className="font-medium text-foreground">
                        {event.organizer}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex gap-4 rounded-2xl">
                    <div className="flex size-13 shrink-0 flex-col items-center rounded-2xl border bg-card text-center">
                      <span className="text-xs bg-accent w-full rounded-t-xl py-px font-semibold uppercase text-muted-foreground">
                        {formatMonth(event.startsAt)}
                      </span>
                      <span className="text-lg font-semibold">
                        {formatDay(event.startsAt)}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-lg font-semibold">
                        {formatFullDate(event.startsAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeOnly(event.startsAt)} -{" "}
                        {formatTimeOnly(event.endsAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 rounded-2xl">
                    <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border bg-card">
                      {event.type === EventType.ONLINE ? (
                        <Video className="size-6 text-muted-foreground" />
                      ) : (
                        <MapPin className="size-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-lg font-semibold">
                        {getLocationLabel(event)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getLocationSubLabel(event)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="rounded-3xl border border-border/70 bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h3 className="text-lg font-semibold">Registration</h3>
                </div>
                <div className="space-y-5 px-4 py-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-background/60 p-3">
                    <div className="rounded-xl bg-accent p-3">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {event.visibility === EventVisibility.PRIVATE
                          ? "Private Access"
                          : "Approval Required"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.visibility === EventVisibility.PRIVATE
                          ? "Only people with the link can access this event."
                          : "This event is visible publicly and follows the current event access settings."}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full rounded-xl"
                    onClick={() => setIsInviteDialogOpen(true)}
                    disabled={status === EventStatus.CANCELLED}
                  >
                    {status === EventStatus.CANCELLED
                      ? "Event Cancelled"
                      : "Invite Attendees"}
                  </Button>

                  <div className="space-y-3 rounded-2xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Member registrations</p>
                        <p className="text-sm text-muted-foreground">
                          Approve requests before the event. After it ends, mark
                          approved members as attended for certificate eligibility.
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {pendingAttendees.length} pending
                      </Badge>
                    </div>

                    {pendingAttendees.length ? (
                      <div className="space-y-2">
                        {pendingAttendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background p-3"
                          >
                            <div>
                              <p className="font-medium">{attendee.member.fullName}</p>
                              <p className="text-xs text-muted-foreground">{attendee.member.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reviewAttendeeMutation.isPending}
                                onClick={() => handleReviewAttendee(attendee.id, "REJECTED")}
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                disabled={reviewAttendeeMutation.isPending}
                                onClick={() => handleReviewAttendee(attendee.id, "APPROVED")}
                              >
                                <Check className="size-3.5" /> Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {status === EventStatus.COMPLETED && approvedAttendees.length ? (
                      <div className="space-y-2 border-t pt-3">
                        <p className="text-sm font-medium">Confirm attendance</p>
                        {approvedAttendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background p-3"
                          >
                            <div>
                              <p className="font-medium">{attendee.member.fullName}</p>
                              <p className="text-xs text-muted-foreground">Approved — not yet certificate-eligible</p>
                            </div>
                            <Button
                              size="sm"
                              disabled={reviewAttendeeMutation.isPending}
                              onClick={() => handleReviewAttendee(attendee.id, "ATTENDED")}
                            >
                              <Check className="size-3.5" /> Mark attended
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {status === EventStatus.COMPLETED && attendedCount ? (
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/members/certifications?eventId=${encodeURIComponent(event.id)}`}>
                          Generate certificates for {attendedCount} attendee{attendedCount === 1 ? "" : "s"}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b pb-3 text-lg font-semibold">
                  About Event
                </h3>
                <div className="space-y-5 text-sm leading-6 text-foreground">
                  <p className="whitespace-pre-wrap">{event.description}</p>

                  <div className="space-y-3 text-muted-foreground">
                    <p className="flex items-start gap-3">
                      <CalendarDays className="mt-1 size-5 shrink-0 text-foreground" />
                      <span>
                        Date:{" "}
                        {new Date(event.startsAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Clock3 className="mt-1 size-5 shrink-0 text-foreground" />
                      <span>
                        Time: {formatTimeOnly(event.startsAt)} -{" "}
                        {formatTimeOnly(event.endsAt)}
                      </span>
                    </p>
                    <p className="flex items-start gap-3">
                      {event.type === EventType.ONLINE ? (
                        <Link2 className="mt-1 size-5 shrink-0 text-foreground" />
                      ) : (
                        <MapPin className="mt-1 size-5 shrink-0 text-foreground" />
                      )}
                      <span>
                        {event.type === EventType.ONLINE ? "Access" : "Venue"}:{" "}
                        {getLocationSubLabel(event)}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b pb-3 text-lg font-semibold">
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xl font-semibold">
                      {getLocationLabel(event)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getLocationSubLabel(event)}
                    </p>
                  </div>

                  {showMap && mapQuery ? (
                    <div className="overflow-hidden rounded-[22px] border border-border/70 bg-card">
                      <div className="flex items-center justify-between border-b px-4 py-3">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <a
                            href={getMapsLink(mapQuery)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Maps
                            <ArrowUpRight className="size-4" />
                          </a>
                        </Button>
                      </div>
                      <iframe
                        title={`${event.name} location map`}
                        src={getMapEmbedUrl(mapQuery)}
                        className="h-64 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-card p-3 text-sm text-muted-foreground">
                      {event.type === EventType.ONLINE
                        ? "This event is hosted online, so no physical map is needed."
                        : "No map preview is available for this event yet."}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b pb-3 text-lg font-semibold">
                  Tagged Members
                </h3>
                {event.taggedMembers.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {event.taggedMembers.map((taggedMember) => (
                      <div
                        key={taggedMember.id}
                        className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                      >
                        <Avatar className="size-10">
                          <AvatarImage
                            src={taggedMember.member.user.avatar ?? undefined}
                            alt={taggedMember.member.fullName}
                          />
                          <AvatarFallback>
                            {getInitials(taggedMember.member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {taggedMember.member.fullName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {formatEnumLabel(taggedMember.member.memberType)}
                          </p>
                        </div>
                        <Tag className="size-4 shrink-0 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-card p-3 text-sm text-muted-foreground">
                    No members have been tagged on this event yet.
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="border-b pb-3 text-lg font-semibold">
                  Hosted By
                </h3>
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {event.organizer.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold">{event.organizer}</p>
                      <p className="text-base text-muted-foreground">
                        {getEventCategoryLabel(event.category)} •{" "}
                        {getEventVisibilityLabel(event.visibility)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t pt-5">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      {attendeeCount} Going
                    </div>
                    {attendeeTooltipItems.length ? (
                      <>
                        <div className="mt-2 flex flex-row items-center">
                          <AnimatedTooltip
                            avatarSize={7}
                            items={attendeeTooltipItems}
                          />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {attendeeSummary}
                          {attendeeCount > 2
                            ? ` and ${attendeeCount - 2} others`
                            : ""}
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No invited attendees yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-sm"
                    >
                      {getEventCategoryLabel(event.category)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-sm"
                    >
                      {getEventStatusLabel(status)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-sm"
                    >
                      <Globe2 className="size-3.5" />
                      {getEventVisibilityLabel(event.visibility)}
                    </Badge>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <EventInviteAttendeesDialog
          eventId={event.id}
          eventName={event.name}
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
        />
      </SheetContent>
    </Sheet>
  );
}
