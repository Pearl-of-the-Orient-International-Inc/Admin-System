import {
  endOfMonth,
  eachMonthOfInterval,
  format,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

import { MemberOnboardingStep, MemberStatus } from "@/enums";
import type { AdminMember } from "@/lib/api-types";

type TrendPoint = {
  month: string;
  applications: number;
  approvals: number;
  archived: number;
  activeTotal: number;
  approvalRate: number;
};

type BreakdownItem = {
  label: string;
  value: number;
  percentage: number;
  fill?: string;
};

type InsightItem = {
  title: string;
  value: string;
  detail: string;
};

export type MembershipReportData = {
  summary: {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    approvalRate: number;
    newThisMonth: number;
    monthOverMonthGrowth: number;
    onboardingMembers: number;
    archivedMembers: number;
  };
  trendData: TrendPoint[];
  statusBreakdown: BreakdownItem[];
  typeBreakdown: BreakdownItem[];
  onboardingBreakdown: BreakdownItem[];
  branchBreakdown: BreakdownItem[];
  insights: InsightItem[];
};

const memberTypeLabels: Record<string, string> = {
  ASSOCIATE_CHAPLAIN: "Associate Chaplain",
  PROFESSIONAL_CHAPLAIN: "Professional Chaplain",
  ORDAINED_AND_COMMISSIONED_PRACTITIONER:
    "Ordained & Commissioned Practitioner",
  CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR:
    "Certified Specialist Training Officer/Instructor",
};

const onboardingStepLabels: Record<string, string> = {
  REQUIREMENTS: "Requirements",
  PRE_ORIENTATION: "Pre-orientation",
  PAYMENT_CHECKOUT: "Payment checkout",
  ONLINE_INTERVIEW: "Online interview",
  ID_GENERATION: "ID generation",
  CHAPLAINCY_101: "Chaplaincy 101",
  OATH_TAKING: "Oath taking",
};

const onboardingStepOrder = [
  MemberOnboardingStep.REQUIREMENTS,
  MemberOnboardingStep.PRE_ORIENTATION,
  MemberOnboardingStep.PAYMENT_CHECKOUT,
  MemberOnboardingStep.ONLINE_INTERVIEW,
  MemberOnboardingStep.ID_GENERATION,
  MemberOnboardingStep.CHAPLAINCY_101,
  MemberOnboardingStep.OATH_TAKING,
] as const;

const onboardingStepColors: Record<string, string> = {
  REQUIREMENTS: "#64748b",
  PRE_ORIENTATION: "#0ea5e9",
  PAYMENT_CHECKOUT: "#f59e0b",
  ONLINE_INTERVIEW: "#8b5cf6",
  ID_GENERATION: "#14b8a6",
  CHAPLAINCY_101: "#ef4444",
  OATH_TAKING: "#22c55e",
};

const statusColors: Record<string, string> = {
  Approved: "#16a34a",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
  Archived: "#64748b",
};

const typeColors = ["#2563eb", "#0d9488", "#9333ea", "#ea580c"];

export function buildMembershipReportData(
  members: AdminMember[],
  monthsToShow: number,
): MembershipReportData {
  const now = new Date();
  const activeMembers = members.filter((member) => member.isActive);
  const totalMembers = members.length;
  const approvedMembers = members.filter(
    (member) => member.isActive && member.status === MemberStatus.APPROVED,
  ).length;
  const pendingMembers = members.filter(
    (member) => member.isActive && member.status === MemberStatus.PENDING,
  ).length;
  const rejectedMembers = members.filter(
    (member) => member.isActive && member.status === MemberStatus.REJECTED,
  ).length;
  const archivedMembers = members.filter((member) => !member.isActive).length;
  const approvalRate = totalMembers
    ? Math.round((approvedMembers / totalMembers) * 100)
    : 0;

  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const newThisMonth = members.filter((member) =>
    isDateInInterval(member.createdAt, thisMonthStart, now),
  ).length;
  const newLastMonth = members.filter((member) =>
    isDateInInterval(member.createdAt, lastMonthStart, lastMonthEnd),
  ).length;
  const monthOverMonthGrowth = newThisMonth - newLastMonth;

  const onboardingMembers = activeMembers.filter((member) => {
    const step = getOnboardingStep(member);

    return !(
      step === MemberOnboardingStep.OATH_TAKING &&
      member.status === MemberStatus.APPROVED
    );
  }).length;

  const trendData = buildTrendData(members, now, monthsToShow);
  const statusBreakdown = buildBreakdown(
    [
      { label: "Approved", value: approvedMembers, fill: statusColors.Approved },
      { label: "Pending", value: pendingMembers, fill: statusColors.Pending },
      { label: "Rejected", value: rejectedMembers, fill: statusColors.Rejected },
      { label: "Archived", value: archivedMembers, fill: statusColors.Archived },
    ],
    totalMembers,
  );

  const typeCounts = new Map<string, number>();
  activeMembers.forEach((member) => {
    const label =
      memberTypeLabels[member.memberType] ??
      sentenceCase(member.memberType.replaceAll("_", " "));
    typeCounts.set(label, (typeCounts.get(label) ?? 0) + 1);
  });

  const typeBreakdown = buildBreakdown(
    Array.from(typeCounts.entries())
      .map(([label, value], index) => ({
        label,
        value,
        fill: typeColors[index % typeColors.length],
      }))
      .sort((left, right) => right.value - left.value),
    activeMembers.length,
  );

  const onboardingCounts = new Map<string, number>();
  activeMembers.forEach((member) => {
    const step = getOnboardingStep(member);
    onboardingCounts.set(step, (onboardingCounts.get(step) ?? 0) + 1);
  });

  const onboardingBreakdown = buildBreakdown(
    onboardingStepOrder.map((step) => ({
      label: onboardingStepLabels[step],
      value: onboardingCounts.get(step) ?? 0,
      fill: onboardingStepColors[step],
    })),
    activeMembers.length,
  );

  const branchCounts = new Map<string, number>();
  activeMembers.forEach((member) => {
    const branches = [
      ...(member.preferredBranches?.map((branch) => branch.title.trim()) ?? []),
      member.preferredBranchOther?.trim() ?? "",
    ].filter(Boolean);

    if (!branches.length) {
      branchCounts.set(
        "Not specified",
        (branchCounts.get("Not specified") ?? 0) + 1,
      );
      return;
    }

    branches.forEach((branch) => {
      branchCounts.set(branch, (branchCounts.get(branch) ?? 0) + 1);
    });
  });

  const branchBreakdown = buildBreakdown(
    Array.from(branchCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6),
    activeMembers.length,
  );

  const strongestMonth = [...trendData].sort(
    (left, right) => right.applications - left.applications,
  )[0];
  const topBranch = branchBreakdown[0];
  const topStage = [...onboardingBreakdown].sort(
    (left, right) => right.value - left.value,
  )[0];
  const latestThirtyDays = activeMembers.filter((member) =>
    isDateInInterval(member.createdAt, subDays(now, 30), now),
  ).length;

  return {
    summary: {
      totalMembers,
      activeMembers: activeMembers.length,
      pendingMembers,
      approvalRate,
      newThisMonth,
      monthOverMonthGrowth,
      onboardingMembers,
      archivedMembers,
    },
    trendData,
    statusBreakdown,
    typeBreakdown,
    onboardingBreakdown,
    branchBreakdown,
    insights: [
      {
        title: "Strongest intake month",
        value: strongestMonth
          ? `${strongestMonth.month} (${strongestMonth.applications})`
          : "No data",
        detail:
          "Applications are grouped by record creation date in the selected window.",
      },
      {
        title: "Most selected branch",
        value: topBranch ? `${topBranch.label}` : "No branch data",
        detail: topBranch
          ? `${topBranch.value} active members selected this service area.`
          : "Branch preferences have not been captured yet.",
      },
      {
        title: "Largest onboarding queue",
        value: topStage ? topStage.label : "No stage data",
        detail: topStage
          ? `${topStage.value} active members currently cluster in this stage.`
          : "No onboarding progress is available yet.",
      },
      {
        title: "Last 30 days",
        value: `${latestThirtyDays} active joins`,
        detail:
          "Quick pulse on how much fresh membership activity reached the roster recently.",
      },
    ],
  };
}

function buildTrendData(
  members: AdminMember[],
  now: Date,
  monthsToShow: number,
): TrendPoint[] {
  const monthStarts = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, monthsToShow - 1)),
    end: startOfMonth(now),
  });

  return monthStarts.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    const activeTotal = members.filter((member) => {
      const createdAt = new Date(member.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }

      return member.isActive && createdAt <= monthEnd;
    }).length;
    const approvals = members.filter(
      (member) =>
        member.isActive &&
        member.status === MemberStatus.APPROVED &&
        isDateInInterval(member.updatedAt, monthStart, monthEnd),
    ).length;
    const applications = members.filter((member) =>
      isDateInInterval(member.createdAt, monthStart, monthEnd),
    ).length;

    return {
      month: format(monthStart, "MMM"),
      applications,
      approvals,
      archived: members.filter(
        (member) =>
          !member.isActive &&
          isDateInInterval(member.updatedAt, monthStart, monthEnd),
      ).length,
      activeTotal,
      approvalRate: applications ? Math.round((approvals / applications) * 100) : 0,
    };
  });
}

function buildBreakdown(
  items: Array<{ label: string; value: number; fill?: string }>,
  total: number,
) {
  return items.map((item) => ({
    ...item,
    percentage: total ? Math.round((item.value / total) * 100) : 0,
  }));
}

function getOnboardingStep(member: AdminMember) {
  return member.onboardingProgress?.currentStep ?? MemberOnboardingStep.REQUIREMENTS;
}

function isDateInInterval(value: string, start: Date, end: Date) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return isWithinInterval(parsed, { start, end });
}

function sentenceCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
