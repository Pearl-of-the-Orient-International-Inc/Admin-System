import {
  EventCategory,
  EventMeetingPlatform,
  EventStatus,
  EventType,
  EventVisibility,
} from "@/enums";
import type { EventResource } from "@/features/events/event.types";

export type EventRecord = EventResource;

export const eventCategoryOptions: Array<{
  value: EventCategory;
  label: string;
}> = [
  { value: EventCategory.CONFERENCE, label: "Conference" },
  { value: EventCategory.OUTREACH, label: "Outreach" },
  { value: EventCategory.TRAINING, label: "Training" },
  { value: EventCategory.WORSHIP, label: "Worship" },
  { value: EventCategory.ORIENTATION, label: "Orientation" },
  { value: EventCategory.SEMINAR, label: "Seminar" },
  { value: EventCategory.FELLOWSHIP, label: "Fellowship" },
  { value: EventCategory.PRAYER, label: "Prayer" },
  { value: EventCategory.OTHER, label: "Other" },
];

export const eventTypeOptions: Array<{
  value: EventType;
  label: string;
}> = [
  { value: EventType.ONSITE, label: "Onsite" },
  { value: EventType.ONLINE, label: "Online" },
];

export const eventStatusOptions: Array<{
  value: EventStatus;
  label: string;
}> = [
  { value: EventStatus.SCHEDULED, label: "Scheduled" },
  { value: EventStatus.ONGOING, label: "Ongoing" },
  { value: EventStatus.COMPLETED, label: "Completed" },
  { value: EventStatus.CANCELLED, label: "Cancelled" },
];

export const eventVisibilityOptions: Array<{
  value: EventVisibility;
  label: string;
}> = [
  { value: EventVisibility.PUBLIC, label: "Public" },
  { value: EventVisibility.PRIVATE, label: "Private" },
];

export const eventMeetingPlatformOptions: Array<{
  value: EventMeetingPlatform;
  label: string;
}> = [
  { value: EventMeetingPlatform.ZOOM, label: "Zoom" },
  { value: EventMeetingPlatform.GOOGLE_MEET, label: "Google Meet" },
  { value: EventMeetingPlatform.MICROSOFT_TEAMS, label: "Microsoft Teams" },
  { value: EventMeetingPlatform.OTHER, label: "Other" },
];

export function getEventCategoryLabel(category: EventCategory) {
  return (
    eventCategoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

export function getEventTypeLabel(type: EventType) {
  return eventTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function getEventStatusLabel(status: EventStatus) {
  return (
    eventStatusOptions.find((option) => option.value === status)?.label ?? status
  );
}

export function resolveEventStatus(event: Pick<EventRecord, "startsAt" | "endsAt" | "status">) {
  if (event.status === EventStatus.CANCELLED) {
    return EventStatus.CANCELLED;
  }

  const now = new Date();
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);

  if (!Number.isNaN(startsAt.getTime()) && !Number.isNaN(endsAt.getTime())) {
    if (now >= startsAt && now <= endsAt) {
      return EventStatus.ONGOING;
    }

    if (now > endsAt) {
      return EventStatus.COMPLETED;
    }
  }

  return EventStatus.SCHEDULED;
}

export function getEventVisibilityLabel(visibility: EventVisibility) {
  return (
    eventVisibilityOptions.find((option) => option.value === visibility)?.label ??
    visibility
  );
}

export function getEventMeetingPlatformLabel(
  platform: EventMeetingPlatform | null,
) {
  if (!platform) return null;

  return (
    eventMeetingPlatformOptions.find((option) => option.value === platform)?.label ??
    platform
  );
}

export function inferMeetingPlatform(
  link: string,
): EventMeetingPlatform | null {
  const normalizedLink = link.trim().toLowerCase();

  if (!normalizedLink) return null;
  if (normalizedLink.includes("zoom.us")) return EventMeetingPlatform.ZOOM;
  if (normalizedLink.includes("meet.google.com")) {
    return EventMeetingPlatform.GOOGLE_MEET;
  }
  if (
    normalizedLink.includes("teams.microsoft.com") ||
    normalizedLink.includes("teams.live.com")
  ) {
    return EventMeetingPlatform.MICROSOFT_TEAMS;
  }

  return EventMeetingPlatform.OTHER;
}
