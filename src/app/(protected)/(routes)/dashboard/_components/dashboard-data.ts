import {
  BadgeCheck,
  CalendarClock,
  FileText,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { EventCategory, EventStatus, EventType } from "@/enums";
import {
  formatMemoDateTime,
  memoAnnouncementRecords,
  memoTemplateOptions,
} from "../../memo-announcements/_components/memo-announcements-data";

export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  description: string;
  tone: string;
  icon: typeof Users;
};

export type DashboardMonthlyTrend = {
  month: string;
  applications: number;
  approvals: number;
  events: number;
};

export type DashboardOnboardingStage = {
  stage: string;
  members: number;
  fill: string;
};

export type DashboardScheduleItem = {
  id: string;
  title: string;
  category: EventCategory;
  type: EventType;
  status: EventStatus;
  startsAt: string;
  endsAt: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
};

export type DashboardUpcomingEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  type: EventType;
  category: EventCategory;
  attendees: number;
  location: string;
};

export type DashboardMemoHighlight = {
  id: string;
  title: string;
  category: string;
  issuedAtLabel: string;
  author: string;
  summary: string;
  signatories: string[];
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "success" | "warning" | "info";
};

export type DashboardDeadline = {
  id: string;
  label: string;
  due: string;
  owner: string;
};

export const dashboardStats: DashboardStat[] = [
  {
    title: "Total Members",
    value: "1,284",
    change: "+6.4%",
    description: "Approved and active records across the ministry roster.",
    tone:
      "bg-sky-700/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-300",
    icon: Users,
  },
  {
    title: "Pending Applications",
    value: "32",
    change: "11 urgent",
    description: "Applicants waiting for review before endorsement.",
    tone:
      "bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300",
    icon: UserRoundPlus,
  },
  {
    title: "This Week's Events",
    value: "9",
    change: "3 online",
    description: "Formation, worship, and outreach events on the calendar.",
    tone:
      "bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300",
    icon: CalendarClock,
  },
];

export const dashboardMonthlyTrends: DashboardMonthlyTrend[] = [
  { month: "Oct", applications: 38, approvals: 24, events: 8 },
  { month: "Nov", applications: 44, approvals: 27, events: 10 },
  { month: "Dec", applications: 31, approvals: 22, events: 7 },
  { month: "Jan", applications: 49, approvals: 35, events: 11 },
  { month: "Feb", applications: 52, approvals: 39, events: 12 },
  { month: "Mar", applications: 46, approvals: 33, events: 9 },
];

export const dashboardOnboardingStages: DashboardOnboardingStage[] = [
  {
    stage: "Pre-orientation",
    members: 18,
    fill: "var(--color-stageOrientation)",
  },
  {
    stage: "Payment checkout",
    members: 12,
    fill: "var(--color-stagePayment)",
  },
  {
    stage: "Online interview",
    members: 9,
    fill: "var(--color-stageInterview)",
  },
  {
    stage: "ID generation",
    members: 6,
    fill: "var(--color-stageId)",
  },
  {
    stage: "Chaplaincy training",
    members: 14,
    fill: "var(--color-stageTraining)",
  },
];

export const dashboardSchedulesByDate: Record<string, DashboardScheduleItem[]> = {
  "2026-03-26": [
    {
      id: "sched-1",
      title: "Applicant screening and endorsement review",
      category: EventCategory.ORIENTATION,
      type: EventType.ONLINE,
      status: EventStatus.SCHEDULED,
      startsAt: "2026-03-26T09:00:00+08:00",
      endsAt: "2026-03-26T11:00:00+08:00",
      date: "2026-03-26",
      time: "9:00 AM - 11:00 AM",
      location: "Zoom room A",
      organizer: "Membership Review Team",
    },
    {
      id: "sched-2",
      title: "Holy Week volunteer coordination",
      category: EventCategory.WORSHIP,
      type: EventType.ONSITE,
      status: EventStatus.SCHEDULED,
      startsAt: "2026-03-26T13:30:00+08:00",
      endsAt: "2026-03-26T15:00:00+08:00",
      date: "2026-03-26",
      time: "1:30 PM - 3:00 PM",
      location: "National office conference room",
      organizer: "Communications Office",
    },
    {
      id: "sched-3",
      title: "Chaplaincy training facilitation check-in",
      category: EventCategory.TRAINING,
      type: EventType.ONLINE,
      status: EventStatus.SCHEDULED,
      startsAt: "2026-03-26T16:00:00+08:00",
      endsAt: "2026-03-26T17:00:00+08:00",
      date: "2026-03-26",
      time: "4:00 PM - 5:00 PM",
      location: "Google Meet",
      organizer: "Formation Unit",
    },
  ],
  "2026-03-27": [
    {
      id: "sched-4",
      title: "Regional office holder alignment",
      category: EventCategory.CONFERENCE,
      type: EventType.ONSITE,
      status: EventStatus.SCHEDULED,
      startsAt: "2026-03-27T10:00:00+08:00",
      endsAt: "2026-03-27T12:00:00+08:00",
      date: "2026-03-27",
      time: "10:00 AM - 12:00 PM",
      location: "Regional headquarters",
      organizer: "Executive Secretariat",
    },
  ],
  "2026-03-28": [
    {
      id: "sched-5",
      title: "Weekend outreach deployment briefing",
      category: EventCategory.OUTREACH,
      type: EventType.ONSITE,
      status: EventStatus.SCHEDULED,
      startsAt: "2026-03-28T07:30:00+08:00",
      endsAt: "2026-03-28T08:30:00+08:00",
      date: "2026-03-28",
      time: "7:30 AM - 8:30 AM",
      location: "Operations dispatch area",
      organizer: "Operations Office",
    },
  ],
};

export const dashboardUpcomingEvents: DashboardUpcomingEvent[] = [
  {
    id: "event-1",
    title: "Holy Week Service Schedule Launch",
    description:
      "Final coordination for worship leaders, ushers, and branch marshals before public release.",
    startsAt: "2026-03-27T08:30:00+08:00",
    type: EventType.ONSITE,
    category: EventCategory.WORSHIP,
    attendees: 124,
    location: "Pearl of the Orient Main Chapel",
  },
  {
    id: "event-2",
    title: "Online Interview Block for New Applicants",
    description:
      "Back-to-back interview slots for applicants who completed payment and pre-orientation.",
    startsAt: "2026-03-28T13:00:00+08:00",
    type: EventType.ONLINE,
    category: EventCategory.ORIENTATION,
    attendees: 18,
    location: "Zoom",
  },
  {
    id: "event-3",
    title: "Chaplaincy Training Cohort 4",
    description:
      "Module delivery for certified specialist and associate chaplain tracks.",
    startsAt: "2026-03-30T09:00:00+08:00",
    type: EventType.ONLINE,
    category: EventCategory.TRAINING,
    attendees: 42,
    location: "Google Meet",
  },
  {
    id: "event-4",
    title: "Barangay Outreach and Prayer Caravan",
    description:
      "Joint field activity with volunteer deployment, prayer stations, and pastoral support.",
    startsAt: "2026-04-02T06:30:00+08:00",
    type: EventType.ONSITE,
    category: EventCategory.OUTREACH,
    attendees: 87,
    location: "Barangay San Isidro",
  },
];

const latestMemoRecord = memoAnnouncementRecords[0];
const latestMemoCategoryLabel =
  memoTemplateOptions.find((option) => option.value === latestMemoRecord.category)
    ?.title ?? latestMemoRecord.category;

export const dashboardLatestMemo: DashboardMemoHighlight = {
  id: latestMemoRecord.id,
  title: latestMemoRecord.title,
  category: latestMemoCategoryLabel,
  issuedAtLabel: formatMemoDateTime(latestMemoRecord.issuedAt),
  author: latestMemoRecord.author,
  summary: latestMemoRecord.summary,
  signatories: latestMemoRecord.signatories,
};

export const dashboardActivityFeed: DashboardActivityItem[] = [
  {
    id: "activity-1",
    title: "12 applicants advanced to payment checkout",
    detail: "Pre-orientation verification was completed by the membership desk.",
    time: "18 minutes ago",
    tone: "success",
  },
  {
    id: "activity-2",
    title: "Holy Week service memo was issued",
    detail: "Communications office published the latest announcement package.",
    time: "2 hours ago",
    tone: "info",
  },
  {
    id: "activity-3",
    title: "Two office posts still need reassignment",
    detail: "Regional deputy chaplain director and barangay deputy chaplain remain open.",
    time: "Today, 9:10 AM",
    tone: "warning",
  },
  {
    id: "activity-4",
    title: "Backup verification passed",
    detail: "Nightly database backup completed and integrity checks were successful.",
    time: "Today, 2:15 AM",
    tone: "success",
  },
];

export const dashboardDeadlines: DashboardDeadline[] = [
  {
    id: "deadline-1",
    label: "Approve applicants for Saturday interview block",
    due: "Today, 5:00 PM",
    owner: "Membership Review Team",
  },
  {
    id: "deadline-2",
    label: "Finalize signatories for quarterly ministry memo",
    due: "Mar 27, 10:00 AM",
    owner: "Executive Secretariat",
  },
  {
    id: "deadline-3",
    label: "Assign facilitator for Cohort 4 chaplaincy training",
    due: "Mar 29, 1:00 PM",
    owner: "Formation Unit",
  },
];

export const dashboardHealthCards = [
  {
    title: "Member onboarding health",
    value: "84%",
    detail: "Applicants are moving steadily through the required stages.",
    icon: BadgeCheck,
    tone:
      "bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300",
  },
  {
    title: "Office coverage",
    value: "26 / 28",
    detail: "Most ministry posts are assigned with only two open leadership roles.",
    icon: ShieldCheck,
    tone:
      "bg-indigo-700/10 text-indigo-700 dark:bg-indigo-300/10 dark:text-indigo-300",
  },
  {
    title: "Active memo circulation",
    value: "6",
    detail: "Recent directives and announcements available for branch follow-through.",
    icon: FileText,
    tone:
      "bg-orange-700/10 text-orange-700 dark:bg-orange-300/10 dark:text-orange-300",
  },
];
