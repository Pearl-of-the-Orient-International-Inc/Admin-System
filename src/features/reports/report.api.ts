import { api } from "@/lib/http-client";
import type {
  DashboardReportResponse,
  MemberLocationReportResponse,
  MinistryReportResponse,
} from "@/lib/api-types";
import type {
  DashboardReportQueryParams,
  MemberLocationReportQueryParams,
  MinistryReportQueryParams,
} from "./report.types";

export async function getMinistryReport(
  params: MinistryReportQueryParams = {},
) {
  const { data } = await api.get<MinistryReportResponse>("/reports/ministry", {
    params,
  });

  return data.data;
}

export async function getDashboardReport(
  params: DashboardReportQueryParams = {},
) {
  const { data } = await api.get<DashboardReportResponse>("/reports/dashboard", {
    params,
  });

  return data.data;
}

export async function getMemberLocationReport(
  params: MemberLocationReportQueryParams = {},
) {
  const { data } = await api.get<MemberLocationReportResponse>(
    "/reports/dashboard/member-locations",
    {
      params,
    },
  );

  return data.data;
}
