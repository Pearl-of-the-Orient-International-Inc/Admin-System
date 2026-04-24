import { useQuery } from "@tanstack/react-query";
import * as reportApi from "./report.api";
import type { MinistryReportQueryParams } from "./report.types";

export const useMinistryReportQuery = (
  params: MinistryReportQueryParams = {},
) =>
  useQuery({
    queryKey: ["reports", "ministry", params],
    queryFn: () => reportApi.getMinistryReport(params),
    staleTime: 60_000,
  });
