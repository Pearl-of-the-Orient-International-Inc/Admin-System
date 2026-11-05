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

export type MemberCredentialDocumentType = "CERTIFICATE" | "RECOGNITION";

export type GenerateMemberCredentialDocumentRequest = {
  memberId: string;
  type: MemberCredentialDocumentType;
};

export type MemberCredentialDocument = {
  id: string;
  documentNumber: string;
  barcodeNumber: string | null;
  verificationToken: string;
  type: MemberCredentialDocumentType;
  status: "ACTIVE" | "REVOKED";
  title: string | null;
  issuedAt: string;
  memberId: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberCredentialDocumentResponse = {
  code: string;
  message: string;
  data: MemberCredentialDocument;
};

export type CreateMemberCertificateByAdminRequest = {
  memberId: string;
  type: MemberCredentialDocumentType;
  title: string;
  issuer: string;
  referenceNumber: string;
  certificateUrl: string;
  issuedAt: string;
  expiresAt?: string | null;
};
