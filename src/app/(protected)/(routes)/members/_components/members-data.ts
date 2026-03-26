import { CivilStatus, Gender, MemberStatus, MemberType } from "@/enums";
import type { AdminMember } from "@/lib/api-types";

export type MemberRecordStatus = "Approved" | "Pending" | "Rejected" | "Archived";

export type MemberRecord = {
  id: string;
  memberId: string;
  uniqueId: string | null;
  avatarUrl: string | null;
  fullName: string;
  memberType: string;
  email: string;
  mobile: string;
  civilStatus: string;
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

export function mapMemberToRecord(member: AdminMember): MemberRecord {
  return {
    id: member.uniqueId ?? member.id,
    memberId: member.id,
    uniqueId: member.uniqueId,
    avatarUrl: member.user.avatar,
    fullName: buildFullName(member),
    memberType: formatMemberType(member.memberType),
    email: member.user.email,
    mobile: member.mobilePhoneNumber?.trim() || "Not provided",
    gender: member.gender,
    civilStatus: formatCivilStatus(member.civilStatus),
    branchOfService: member.preferredBranchOther?.trim() || "Not specified",
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
  return [
    member.firstName,
    member.middleInitial?.trim(),
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
