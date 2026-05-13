export type MinistryReportQueryParams = {
  months?: number;
};

export type DashboardReportQueryParams = {
  months?: number;
};

export type MemberLocationGranularity =
  | "province"
  | "municipality"
  | "barangay";

export type MemberLocationReportQueryParams = {
  months?: number;
  granularity?: MemberLocationGranularity;
  region?: string;
  province?: string;
  municipalityCity?: string;
};
