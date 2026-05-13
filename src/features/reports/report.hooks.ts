import { useQuery } from "@tanstack/react-query";
import * as reportApi from "./report.api";
import type {
  DashboardReportQueryParams,
  MemberLocationReportQueryParams,
  MinistryReportQueryParams,
} from "./report.types";

export const useMinistryReportQuery = (
  params: MinistryReportQueryParams = {},
) =>
  useQuery({
    queryKey: ["reports", "ministry", params],
    queryFn: () => reportApi.getMinistryReport(params),
    staleTime: 60_000,
  });

export const useDashboardReportQuery = (
  params: DashboardReportQueryParams = {},
) =>
  useQuery({
    queryKey: ["reports", "dashboard", params],
    queryFn: () => reportApi.getDashboardReport(params),
    staleTime: 60_000,
  });

export const useMemberLocationReportQuery = (
  params: MemberLocationReportQueryParams = {},
) =>
  useQuery({
    queryKey: ["reports", "dashboard", "member-locations", params],
    queryFn: () => reportApi.getMemberLocationReport(params),
    staleTime: 60_000,
  });
