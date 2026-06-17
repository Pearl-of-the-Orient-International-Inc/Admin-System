import { CivilStatus, Gender, MemberStatus, MemberType } from "@/enums";
import type { AdminMember } from "@/lib/api-types";

export type MemberRecordStatus = "Approved" | "Pending" | "Rejected" | "Archived";

export type MemberRecord = {
  id: string;
  memberId: string;
  uniqueId: string | null;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  memberTypeValue: MemberType;
  memberType: string;
  email: string;
  isEmailVerified: boolean;
  mobile: string;
  civilStatus: string;
  branchOfServiceValues: string[];
  branchOfService: string;
  gender: Gender;
  status: MemberRecordStatus;
  badgeNumber: string | null;
  appliedAt: string;
};

export const branchOfServiceOptions = [
  "Humanitarian",
  "Hospital and Care",
  "Military/PNP",
  "School",
  "Corporate",
  "Disaster & Rescue Operations",
  "Prison",
  "Security",
  "Government",
  "DSWD",
  "Others",
];

export const memberTypeFilterOptions = [
  {
    value: MemberType.ASSOCIATE_CHAPLAIN,
    label: "Associate Chaplain",
  },
  {
    value: MemberType.PROFESSIONAL_CHAPLAIN,
    label: "Professional Chaplain",
  },
  {
    value: MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER,
    label: "Ordained and Commissioned Practitioner",
  },
  {
    value: MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR,
    label: "Certified Specialist Training Officer/Instructor",
  },
] as const;

export function mapMemberToRecord(member: AdminMember): MemberRecord {
  const branchOfServiceValues = getBranchOfServiceValues(member);

  return {
    id: member.uniqueId ?? member.id,
    memberId: member.id,
    uniqueId: member.uniqueId,
    avatarUrl: member.user.avatar,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: buildFullName(member),
    memberTypeValue: member.memberType,
    memberType: formatMemberType(member.memberType),
    email: member.user.email,
    isEmailVerified: Boolean(member.user.isEmailVerified),
    mobile: member.mobilePhoneNumber?.trim() || "Not provided",
    gender: member.gender,
    civilStatus: formatCivilStatus(member.civilStatus),
    branchOfServiceValues,
    branchOfService:
      branchOfServiceValues.length > 0
        ? branchOfServiceValues.join(", ")
        : "Not specified",
    status: getMemberRecordStatus(member),
    badgeNumber: member.badgeNumber,
    appliedAt: member.createdAt,
  };
}

function formatMemberType(memberType: MemberType) {
  switch (memberType) {
    case MemberType.PROFESSIONAL_CHAPLAIN:
      return "Professional Chaplain";
    case MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER:
      return "Ordained and Commissioned Practitioner";
    case MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR:
      return "Certified Specialist Training Officer/Instructor";
    case MemberType.ASSOCIATE_CHAPLAIN:
    default:
      return "Associate Chaplain";
  }
}

function buildFullName(member: AdminMember) {
  const middleInitial = member.middleInitial?.trim();

  return [
    member.firstName,
    middleInitial
      ? middleInitial.endsWith(".")
        ? middleInitial
        : `${middleInitial}.`
      : null,
    member.lastName,
    member.extensionName?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function formatCivilStatus(civilStatus: CivilStatus | null) {
  if (!civilStatus) {
    return "Not specified";
  }

  return civilStatus.charAt(0) + civilStatus.slice(1).toLowerCase();
}

function getBranchOfServiceValues(member: AdminMember) {
  const preferredBranches =
    member.preferredBranches
      ?.map((branch) => branch.title.trim())
      .filter(Boolean) ?? [];
  const otherBranch = member.preferredBranchOther?.trim();

  return otherBranch
    ? [...preferredBranches, otherBranch]
    : preferredBranches;
}

function getMemberRecordStatus(member: AdminMember): MemberRecordStatus {
  if (!member.isActive) {
    return "Archived";
  }

  if (member.status === MemberStatus.APPROVED) {
    return "Approved";
  }

  if (member.status === MemberStatus.REJECTED) {
    return "Rejected";
  }

  return "Pending";
}
