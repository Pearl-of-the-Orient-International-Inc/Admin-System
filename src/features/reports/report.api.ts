import { api } from "@/lib/http-client";
import type { MinistryReportResponse } from "@/lib/api-types";
import type { MinistryReportQueryParams } from "./report.types";

export async function getMinistryReport(
  params: MinistryReportQueryParams = {},
) {
  const { data } = await api.get<MinistryReportResponse>("/reports/ministry", {
    params,
  });

  return data.data;
}
