import type { Gender, MemberStatus, MemberType, SignatureType } from "@/enums";

export type CreateMemberByAdminRequest = {
  email: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  extensionName?: string;
  memberType?: MemberType;
  badgeNumber?: string;
  profileBannerUrl?: string;
  mobilePhoneNumber?: string;
  homeAddress?: string;
  civilStatus?: "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED" | "ANNULLED";
  gender: Gender;
  nationality?: string;
  dateOfBirth: string;
  createdAt?: string;
  region?: string;
  province?: string;
  municipalityCity?: string;
  barangay?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  churchAffiliation?: string;
  churchAddress?: string;
  currentPositionRole?: string;
  currentPositionRoleOther?: string;
  height?: string;
  weight?: string;
  bloodType?: string;
  colorOfEyes?: string;
  colorOfSkin?: string;
  sssNumber?: string;
  tinNumber?: string;
  skillsTalents?: string;
  preferredBranchIds?: string[];
  preferredBranchOther?: string;
  elementarySchool?: string;
  secondarySchool?: string;
  tertiaryCollege?: string;
  postGraduateStudies?: string;
  ministerialExperiences?: {
    roleDescription: string;
    yearsApprox: string;
  }[];
  characterReferences?: {
    name: string;
    positionRelationship: string;
    contactNumber: string;
  }[];
  signature?: {
    type: SignatureType;
    signatureData: string;
  };
};

export type MembersQueryParams = {
  page?: number;
  limit?: number;
  all?: boolean;
  search?: string;
  status?: MemberStatus;
  includeArchived?: boolean;
};

export type MembershipReportQueryParams = {
  months?: number;
};

export type UpdateMemberStatusRequest = {
  memberId: string;
  status: Exclude<MemberStatus, "PENDING">;
};

export type UpdateMemberByAdminRequest = CreateMemberByAdminRequest;

export type UpdateMemberUniqueIdRequest = {
  memberId: string;
  uniqueId: string;
};

export type ChangeMemberPasswordByAdminRequest = {
  memberId: string;
  password: string;
  confirmPassword: string;
};
