import { Gender, SignatureType } from "@/enums";
import type { AdminMember } from "@/lib/api-types";
import type { CreateMemberByAdminRequest } from "@/features/members/member.types";
import type { ApplicationFormState } from "@/shared/membership-application/types";

const CIVIL_STATUS_MAP: Record<
  Exclude<ApplicationFormState["civilStatus"], "">,
  CreateMemberByAdminRequest["civilStatus"]
> = {
  Single: "SINGLE",
  Married: "MARRIED",
  Widowed: "WIDOWED",
  Separated: "SEPARATED",
};

const REVERSE_CIVIL_STATUS_MAP: Record<
  NonNullable<CreateMemberByAdminRequest["civilStatus"]>,
  Exclude<ApplicationFormState["civilStatus"], "">
> = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
  ANNULLED: "Separated",
};

const GENDER_MAP: Record<
  Exclude<ApplicationFormState["gender"], "">,
  CreateMemberByAdminRequest["gender"]
> = {
  Male: Gender.MALE,
  Female: Gender.FEMALE,
};

const REVERSE_GENDER_MAP: Partial<Record<Gender, Exclude<ApplicationFormState["gender"], "">>> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
};

const FORM_POSITION_OPTIONS: ApplicationFormState["position"][] = [
  "",
  "Church Worker",
  "Pastor",
  "Rev.",
  "Bishop",
  "Others",
];

const getOptional = (value?: string | null): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const joinList = (values: string[]): string | undefined => {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(" | ") : undefined;
};

const splitStoredList = (value?: string | null): string[] => {
  const parts = value
    ?.split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts && parts.length > 0 ? parts : [""];
};

const splitRegionSummary = (
  summary: string,
): {
  region?: string;
  province?: string;
  municipalityCity?: string;
  barangay?: string;
} => {
  const parts = summary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 4) return {};

  const [barangayLabel, municipalityCity, province, region] = parts;
  return {
    region: getOptional(region),
    province: getOptional(province),
    municipalityCity: getOptional(municipalityCity),
    barangay: getOptional(barangayLabel.replace(/^Barangay\s+/i, "")),
  };
};

const buildRegionSummary = (member: AdminMember): string => {
  if (
    !member.barangay?.trim() ||
    !member.municipalityCity?.trim() ||
    !member.province?.trim() ||
    !member.region?.trim()
  ) {
    return "";
  }

  return `Barangay ${member.barangay.trim()}, ${member.municipalityCity.trim()}, ${member.province.trim()}, ${member.region.trim()}`;
};

export const mapFormToMemberPayload = (
  form: ApplicationFormState,
): CreateMemberByAdminRequest => {
  if (!form.emailAddress.trim()) {
    throw new Error("Please enter the member's email address.");
  }

  if (!form.firstName.trim() || !form.lastName.trim()) {
    throw new Error("Please enter the member's first and last name.");
  }

  if (!form.gender) {
    throw new Error("Please select the member's gender.");
  }

  if (!form.birthday) {
    throw new Error("Please enter the member's date of birth.");
  }
  const endorsedBy = form.characterReferences[0];
  if (
    !endorsedBy?.name.trim() ||
    !endorsedBy.position.trim() ||
    !endorsedBy.contactNumber.trim()
  ) {
    throw new Error(
      "Please complete the endorsed by name, relationship, and contact number.",
    );
  }

  const location = splitRegionSummary(form.regionProvince);

  const ministerialExperiences = form.ministerialWorkExperience
    .map((experience) => ({
      roleDescription: [experience.rolePosition.trim(), experience.institution.trim()]
        .filter(Boolean)
        .join(" - "),
      yearsApprox: experience.years.trim(),
    }))
    .filter(
      (experience) =>
        experience.roleDescription.length > 0 && experience.yearsApprox.length > 0,
    );

  const characterReferences = form.characterReferences
    .map((reference) => ({
      name: reference.name.trim(),
      positionRelationship: reference.position.trim(),
      contactNumber: reference.contactNumber.trim(),
    }))
    .filter(
      (reference) =>
        reference.name.length > 0 &&
        reference.positionRelationship.length > 0 &&
        reference.contactNumber.length > 0,
    );

  return {
    email: form.emailAddress.trim(),
    firstName: form.firstName.trim(),
    middleInitial: getOptional(form.middleInitial),
    lastName: form.lastName.trim(),
    extensionName: getOptional(form.extensionName),
    memberType: form.memberType,
    badgeNumber: getOptional(form.badgeNumber),
    mobilePhoneNumber: getOptional(form.phoneNumber),
    homeAddress: getOptional(form.address),
    civilStatus: form.civilStatus ? CIVIL_STATUS_MAP[form.civilStatus] : undefined,
    gender: GENDER_MAP[form.gender],
    nationality: getOptional(form.nationality),
    dateOfBirth: new Date(form.birthday).toISOString(),
    region: location.region,
    province: location.province,
    municipalityCity: location.municipalityCity,
    barangay: location.barangay,
    emergencyContactName: getOptional(form.emergencyName),
    emergencyContactMobile: getOptional(form.emergencyCellphone),
    churchAffiliation: getOptional(form.churchOrganizationAffiliation),
    churchAddress: getOptional(form.churchAddress),
    currentPositionRole: getOptional(form.position),
    currentPositionRoleOther: getOptional(form.positionOthers),
    height: getOptional(form.height),
    weight: getOptional(form.weight),
    bloodType: getOptional(form.bloodType),
    colorOfEyes: getOptional(form.colorOfEyes),
    colorOfSkin: getOptional(form.colorOfSkin),
    sssNumber: getOptional(form.sssNumber),
    tinNumber: getOptional(form.tinNumber),
    skillsTalents: getOptional(form.skillsTalents),
    preferredBranchOther: getOptional(
      [form.branchOfService.join(", "), form.branchOfServiceOthers]
        .filter(Boolean)
        .join(", "),
    ),
    elementarySchool: getOptional(form.elementarySchool),
    secondarySchool: getOptional(form.secondarySchool),
    tertiaryCollege: joinList(form.tertiarySchool),
    postGraduateStudies: joinList(form.postGraduateStudies),
    ministerialExperiences:
      ministerialExperiences.length > 0 ? ministerialExperiences : undefined,
    characterReferences:
      characterReferences.length > 0 ? characterReferences : undefined,
    signature: form.signatureUrl.trim()
      ? {
          type: SignatureType.DRAWN,
          signatureData: form.signatureUrl.trim(),
        }
      : undefined,
  };
};

export const mapAdminMemberToUpdatePayload = (
  member: AdminMember,
): CreateMemberByAdminRequest => {
  return {
    email: member.user.email.trim(),
    firstName: member.firstName.trim(),
    middleInitial: getOptional(member.middleInitial),
    lastName: member.lastName.trim(),
    extensionName: getOptional(member.extensionName),
    memberType: member.memberType,
    badgeNumber: getOptional(member.badgeNumber),
    mobilePhoneNumber: getOptional(member.mobilePhoneNumber),
    homeAddress: getOptional(member.homeAddress),
    civilStatus: member.civilStatus ?? undefined,
    gender: member.gender,
    nationality: getOptional(member.nationality),
    dateOfBirth: new Date(member.dateOfBirth).toISOString(),
    region: getOptional(member.region),
    province: getOptional(member.province),
    municipalityCity: getOptional(member.municipalityCity),
    barangay: getOptional(member.barangay),
    emergencyContactName: getOptional(member.emergencyContactName),
    emergencyContactMobile: getOptional(member.emergencyContactMobile),
    churchAffiliation: getOptional(member.churchAffiliation),
    churchAddress: getOptional(member.churchAddress),
    currentPositionRole: getOptional(member.currentPositionRole),
    currentPositionRoleOther: getOptional(member.currentPositionRoleOther),
    height: getOptional(member.height),
    weight: getOptional(member.weight),
    bloodType: getOptional(member.bloodType),
    colorOfEyes: getOptional(member.colorOfEyes),
    colorOfSkin: getOptional(member.colorOfSkin),
    sssNumber: getOptional(member.sssNumber),
    tinNumber: getOptional(member.tinNumber),
    skillsTalents: getOptional(member.skillsTalents),
    preferredBranchIds: member.preferredBranches?.map((branch) => branch.id),
    preferredBranchOther: getOptional(member.preferredBranchOther),
    elementarySchool: getOptional(member.elementarySchool),
    secondarySchool: getOptional(member.secondarySchool),
    tertiaryCollege: getOptional(member.tertiaryCollege),
    postGraduateStudies: getOptional(member.postGraduateStudies),
    ministerialExperiences: member.ministerialExperiences?.map((experience) => ({
      roleDescription: experience.roleDescription,
      yearsApprox: experience.yearsApprox,
    })),
    characterReferences: member.characterReferences?.map((reference) => ({
      name: reference.name,
      positionRelationship: reference.positionRelationship,
      contactNumber: reference.contactNumber,
    })),
    signature: member.signature
      ? {
          type: member.signature.type as SignatureType,
          signatureData: member.signature.signatureData,
        }
      : undefined,
  };
};

export const mapMemberToFormState = (member: AdminMember): ApplicationFormState => {
  const normalizedPosition = member.currentPositionRole?.trim() ?? "";
  const position = FORM_POSITION_OPTIONS.includes(
    normalizedPosition as ApplicationFormState["position"],
  )
    ? (normalizedPosition as ApplicationFormState["position"])
    : "";

  const ministerialWorkExperience =
    member.ministerialExperiences?.map((experience) => {
      const [rolePosition, ...institutionParts] = experience.roleDescription.split(" - ");
      return {
        rolePosition: rolePosition?.trim() ?? "",
        institution: institutionParts.join(" - ").trim(),
        years: experience.yearsApprox ?? "",
      };
    }) ?? [];

  const characterReferences =
    member.characterReferences?.map((reference) => ({
      name: reference.name ?? "",
      position: reference.positionRelationship ?? "",
      contactNumber: reference.contactNumber ?? "",
    })) ?? [];

  return {
    firstName: member.firstName ?? "",
    middleInitial: member.middleInitial ?? "",
    lastName: member.lastName ?? "",
    extensionName: member.extensionName ?? "",
    memberType: member.memberType,
    badgeNumber: member.badgeNumber ?? "",
    emailAddress: member.user.email ?? "",
    address: member.homeAddress ?? "",
    phoneNumber: member.mobilePhoneNumber ?? "",
    civilStatus: member.civilStatus ? REVERSE_CIVIL_STATUS_MAP[member.civilStatus] ?? "" : "",
    gender: REVERSE_GENDER_MAP[member.gender] ?? "",
    nationality: member.nationality ?? "",
    birthday: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().slice(0, 10) : "",
    age: "",
    churchOrganizationAffiliation: member.churchAffiliation ?? "",
    churchAddress: member.churchAddress ?? "",
    regionProvince: buildRegionSummary(member),
    position,
    positionOthers:
      member.currentPositionRoleOther ??
      (position ? "" : normalizedPosition),
    height: member.height ?? "",
    weight: member.weight ?? "",
    bloodType: member.bloodType ?? "",
    colorOfEyes: member.colorOfEyes ?? "",
    colorOfSkin: member.colorOfSkin ?? "",
    sssNumber: member.sssNumber ?? "",
    tinNumber: member.tinNumber ?? "",
    emergencyName: member.emergencyContactName ?? "",
    emergencyCellphone: member.emergencyContactMobile ?? "",
    elementarySchool: member.elementarySchool ?? "",
    secondarySchool: member.secondarySchool ?? "",
    tertiarySchool: splitStoredList(member.tertiaryCollege),
    postGraduateStudies: splitStoredList(member.postGraduateStudies),
    ministerialWorkExperience:
      ministerialWorkExperience.length > 0
        ? ministerialWorkExperience
        : [{ rolePosition: "", institution: "", years: "" }],
    skillsTalents: member.skillsTalents ?? "",
    branchOfService: [],
    branchOfServiceOthers: member.preferredBranchOther ?? "",
    characterReferences:
      characterReferences.length > 0
        ? characterReferences
        : [{ name: "", position: "", contactNumber: "" }],
    photoUrl: "",
    signatureUrl: member.signature?.signatureData ?? "",
    declarationTruthConfirmed: false,
    monthlyPledgeConfirmed: false,
  };
};
