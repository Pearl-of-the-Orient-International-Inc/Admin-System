import {
  addDays,
  eachMonthOfInterval,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";

import type { EventResource } from "@/features/events/event.types";
import type { BranchServiceResource } from "@/features/branch-service/branch-service.types";
import type { OfficeTitleResource } from "@/features/office-title/office-title.types";
import type { OfficerAssignmentResource } from "@/features/officer-assignment/officer-assignment.types";

type TrendPoint = {
  month: string;
  total: number;
  onsite: number;
  online: number;
  completed: number;
};

type BreakdownItem = {
  label: string;
  value: number;
  percentage: number;
  fill?: string;
  detail?: string;
};

type InsightItem = {
  title: string;
  value: string;
  detail: string;
};

type UpcomingItem = {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  startsAtLabel: string;
  daysAwayLabel: string;
};

export type MinistryReportData = {
  summary: {
    totalEvents: number;
    upcomingEvents: number;
    activeBranches: number;
    branchCoverageRate: number;
    leadershipCoverageRate: number;
    filledLeadershipSlots: number;
    openLeadershipSlots: number;
    onlineShare: number;
  };
  trendData: TrendPoint[];
  categoryBreakdown: BreakdownItem[];
  statusBreakdown: BreakdownItem[];
  branchBreakdown: BreakdownItem[];
  leadershipBreakdown: BreakdownItem[];
  upcomingEvents: UpcomingItem[];
  insights: InsightItem[];
};

const eventCategoryLabels: Record<string, string> = {
  CONFERENCE: "Conference",
  OUTREACH: "Outreach",
  TRAINING: "Training",
  WORSHIP: "Worship",
  ORIENTATION: "Orientation",
  SEMINAR: "Seminar",
  FELLOWSHIP: "Fellowship",
  PRAYER: "Prayer",
  OTHER: "Other",
};

const eventCategoryColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#0f766e",
  "#ea580c",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

const eventStatusColors: Record<string, string> = {
  SCHEDULED: "#2563eb",
  ONGOING: "#8b5cf6",
  COMPLETED: "#16a34a",
  CANCELLED: "#ef4444",
};

const leadershipLevelLabels: Record<string, string> = {
  CHIEF_CHAPLAIN: "Chief Chaplain",
  NATIONAL_CHAPLAIN_DIRECTOR: "National Director",
  REGIONAL_CHAPLAIN_DIRECTOR: "Regional Director",
  REGIONAL_DEPUTY_CHAPLAIN_DIRECTOR: "Regional Deputy",
  PROVINCIAL_CHAPLAIN_DIRECTOR: "Provincial Director",
  PROVINCIAL_DEPUTY_CHAPLAIN_DIRECTOR: "Provincial Deputy",
  CITY_CHAPLAIN: "City Chaplain",
  MUNICIPAL_CHAPLAIN: "Municipal Chaplain",
  CITY_MUNICIPAL_DEPUTY_CHAPLAIN: "City/Municipal Deputy",
  BARANGAY_CHAPLAIN: "Barangay Chaplain",
  BARANGAY_DEPUTY_CHAPLAIN: "Barangay Deputy",
};

const leadershipLevelColors = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#e11d48",
  "#0891b2",
];

export function buildMinistryReportData({
  events,
  branchServices,
  officeTitles,
  officerAssignments,
  monthsToShow,
}: {
  events: EventResource[];
  branchServices: BranchServiceResource[];
  officeTitles: OfficeTitleResource[];
  officerAssignments: OfficerAssignmentResource[];
  monthsToShow: number;
}): MinistryReportData {
  const now = new Date();
  const activeBranches = branchServices.filter(
    (branch) => (branch.memberCount ?? 0) > 0,
  );
  const activeOfficeTitles = officeTitles.filter((office) => office.isActive);
  const activeAssignments = officerAssignments.filter(
    (assignment) => assignment.isActive,
  );

  const totalLeadershipSlots = activeOfficeTitles.reduce(
    (sum, office) => sum + Math.max(office.maxSlots ?? 1, 1),
    0,
  );
  const filledLeadershipSlots = activeAssignments.length;
  const openLeadershipSlots = Math.max(
    totalLeadershipSlots - filledLeadershipSlots,
    0,
  );
  const leadershipCoverageRate = totalLeadershipSlots
    ? Math.round((filledLeadershipSlots / totalLeadershipSlots) * 100)
    : 0;

  const totalBranchMembers = branchServices.reduce(
    (sum, branch) => sum + (branch.memberCount ?? 0),
    0,
  );
  const branchCoverageRate = branchServices.length
    ? Math.round((activeBranches.length / branchServices.length) * 100)
    : 0;

  const onlineEvents = events.filter((event) => event.type === "ONLINE").length;
  const upcomingEvents = events
    .filter((event) => {
      const startsAt = new Date(event.startsAt);
      return (
        isAfter(startsAt, now) &&
        isBefore(startsAt, addDays(now, 30)) &&
        event.status !== "CANCELLED"
      );
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );

  const trendData = buildTrendData(events, monthsToShow, now);

  const categoryMap = new Map<string, number>();
  events.forEach((event) => {
    const label =
      eventCategoryLabels[event.category] ??
      sentenceCase(event.category.replace(/_/g, " "));
    categoryMap.set(label, (categoryMap.get(label) ?? 0) + 1);
  });

  const categoryBreakdown = buildBreakdown(
    Array.from(categoryMap.entries())
      .map(([label, value], index) => ({
        label,
        value,
        fill: eventCategoryColors[index % eventCategoryColors.length],
      }))
      .sort((left, right) => right.value - left.value),
    events.length,
  );

  const statusMap = new Map<string, number>();
  events.forEach((event) => {
    statusMap.set(event.status, (statusMap.get(event.status) ?? 0) + 1);
  });

  const statusBreakdown = buildBreakdown(
    ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"].map((status) => ({
      label: sentenceCase(status.toLowerCase()),
      value: statusMap.get(status) ?? 0,
      fill: eventStatusColors[status],
    })),
    events.length,
  );

  const branchBreakdown = buildBreakdown(
    branchServices
      .map((branch, index) => ({
        label: branch.title,
        value: branch.memberCount ?? 0,
        fill: eventCategoryColors[index % eventCategoryColors.length],
        detail: `${branch.sections.length} section${branch.sections.length === 1 ? "" : "s"}`,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6),
    totalBranchMembers,
  );

  const assignmentsByOfficeId = new Map<string, number>();
  activeAssignments.forEach((assignment) => {
    assignmentsByOfficeId.set(
      assignment.officeTitleId,
      (assignmentsByOfficeId.get(assignment.officeTitleId) ?? 0) + 1,
    );
  });

  const leadershipByLevel = new Map<string, number>();
  activeOfficeTitles.forEach((office) => {
    const filled = assignmentsByOfficeId.get(office.id) ?? 0;
    leadershipByLevel.set(
      office.level,
      (leadershipByLevel.get(office.level) ?? 0) + filled,
    );
  });

  const leadershipBreakdown = buildBreakdown(
    Array.from(leadershipByLevel.entries())
      .map(([level, value], index) => ({
        label:
          leadershipLevelLabels[level] ?? sentenceCase(level.replace(/_/g, " ")),
        value,
        fill: leadershipLevelColors[index % leadershipLevelColors.length],
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6),
    filledLeadershipSlots,
  );

  const formattedUpcomingEvents = upcomingEvents.slice(0, 5).map((event) => {
    const startsAt = new Date(event.startsAt);
    const dayDiff = Math.max(
      Math.ceil((startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      0,
    );

    return {
      id: event.id,
      title: event.name,
      category:
        eventCategoryLabels[event.category] ??
        sentenceCase(event.category.toLowerCase()),
      type: sentenceCase(event.type.toLowerCase()),
      location: event.location ?? event.onlineLink ?? "TBA",
      startsAtLabel: format(startsAt, "MMM d, yyyy • h:mm a"),
      daysAwayLabel: dayDiff === 0 ? "Today" : `In ${dayDiff} day${dayDiff === 1 ? "" : "s"}`,
    };
  });

  const busiestMonth = [...trendData].sort((left, right) => right.total - left.total)[0];
  const topCategory = categoryBreakdown[0];
  const topBranch = branchBreakdown[0];

  return {
    summary: {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      activeBranches: activeBranches.length,
      branchCoverageRate,
      leadershipCoverageRate,
      filledLeadershipSlots,
      openLeadershipSlots,
      onlineShare: events.length ? Math.round((onlineEvents / events.length) * 100) : 0,
    },
    trendData,
    categoryBreakdown,
    statusBreakdown,
    branchBreakdown,
    leadershipBreakdown,
    upcomingEvents: formattedUpcomingEvents,
    insights: [
      {
        title: "Busiest month",
        value: busiestMonth ? `${busiestMonth.month} (${busiestMonth.total})` : "No data",
        detail:
          "Tracks total ministry events by scheduled start date across the selected reporting window.",
      },
      {
        title: "Most active event category",
        value: topCategory ? topCategory.label : "No category data",
        detail: topCategory
          ? `${topCategory.value} events were scheduled under this ministry stream.`
          : "No event categories have been recorded yet.",
      },
      {
        title: "Strongest branch demand",
        value: topBranch ? topBranch.label : "No branch data",
        detail: topBranch
          ? `${topBranch.value} members are currently aligned with this branch of service.`
          : "No branch member counts are available yet.",
      },
      {
        title: "Leadership gap",
        value: `${openLeadershipSlots} open slot${openLeadershipSlots === 1 ? "" : "s"}`,
        detail:
          totalLeadershipSlots > 0
            ? `${leadershipCoverageRate}% of configured ministry leadership capacity is currently filled.`
            : "No office title capacity has been configured yet.",
      },
    ],
  };
}

function buildTrendData(
  events: EventResource[],
  monthsToShow: number,
  now: Date,
): TrendPoint[] {
  const monthStarts = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, monthsToShow - 1)),
    end: startOfMonth(now),
  });

  return monthStarts.map((monthStart) => {
    const total = events.filter((event) =>
      isEventInMonth(event.startsAt, monthStart),
    );

    return {
      month: format(monthStart, "MMM"),
      total: total.length,
      onsite: total.filter((event) => event.type === "ONSITE").length,
      online: total.filter((event) => event.type === "ONLINE").length,
      completed: total.filter((event) => event.status === "COMPLETED").length,
    };
  });
}

function buildBreakdown(
  items: Array<{
    label: string;
    value: number;
    fill?: string;
    detail?: string;
  }>,
  total: number,
): BreakdownItem[] {
  return items.map((item) => ({
    ...item,
    percentage: total ? Math.round((item.value / total) * 100) : 0,
  }));
}

function isEventInMonth(dateValue: string, monthStart: Date) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return isSameMonth(parsed, monthStart);
}

function sentenceCase(value: string) {
  return value
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/_/g, " ");
}
