import type { MemberType } from "@/enums";

export type BranchOfService =
  | "Humanitarian"
  | "Hospital and Care"
  | "Military/PNP"
  | "School"
  | "Corporate"
  | "Disaster & Rescue Operations"
  | "Prison"
  | "Security"
  | "Government"
  | "DSWD"
  | "Others";

export type ApplicationFormState = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  extensionName: string;
  memberType: MemberType;
  badgeNumber: string;
  emailAddress: string;
  address: string;
  phoneNumber: string;
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "";
  gender: "Male" | "Female" | "";
  nationality: string;
  birthday: string;
  age: string;
  churchOrganizationAffiliation: string;
  churchAddress: string;
  regionProvince: string;
  position: "Church Worker" | "Pastor" | "Rev." | "Bishop" | "Others" | "";
  positionOthers: string;
  height: string;
  weight: string;
  bloodType: string;
  colorOfEyes: string;
  colorOfSkin: string;
  sssNumber: string;
  tinNumber: string;
  emergencyName: string;
  emergencyCellphone: string;
  elementarySchool: string;
  secondarySchool: string;
  tertiarySchool: string[];
  postGraduateStudies: string[];
  ministerialWorkExperience: {
    rolePosition: string;
    institution: string;
    years: string;
  }[];
  skillsTalents: string;
  branchOfService: BranchOfService[];
  branchOfServiceOthers: string;
  characterReferences: {
    name: string;
    position: string;
    contactNumber: string;
  }[];
  photoUrl: string;
  signatureUrl: string;
  declarationTruthConfirmed: boolean;
  monthlyPledgeConfirmed: boolean;
};

export type StepIndex = 0 | 1 | 2 | 3;

export type SharedCurrentUser = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type RegionOption = {
  region_id: number;
  region_name: string;
  region_description: string;
};

export type ProvinceOption = {
  province_id: number;
  province_name: string;
};

export type MunicipalityOption = {
  municipality_id: number;
  municipality_name: string;
};

export type BarangayOption = {
  barangay_id: number;
  barangay_name: string;
};

export type LocationCatalog = {
  getRegions: () => RegionOption[];
  getProvinces: (regionId: number | null) => ProvinceOption[];
  getMunicipalities: (provinceId: number | null) => MunicipalityOption[];
  getBarangays: (municipalityId: number | null) => BarangayOption[];
};
