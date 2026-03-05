import { api } from "@/lib/http-client";
import type {
  BranchServiceEnvelopeResponse,
  BranchServiceListResponse,
  BranchServiceQueryParams,
  CreateBranchServiceRequest,
  UpdateBranchServiceRequest,
} from "./branch-service.types";

export async function getBranchServices(params: BranchServiceQueryParams = {}) {
  const { data } = await api.get<BranchServiceListResponse>("/branch-service", {
    params,
  });

  return {
    items: data.data,
    pagination: data.pagination,
    code: data.code,
    message: data.message,
  };
}

export async function getBranchServiceById(id: string) {
  const { data } = await api.get<BranchServiceEnvelopeResponse>(
    `/branch-service/${encodeURIComponent(id)}`,
  );
  return data.data;
}

export async function createBranchService(payload: CreateBranchServiceRequest) {
  const { data } = await api.post<BranchServiceEnvelopeResponse>(
    "/branch-service/create",
    payload,
  );
  return data.data;
}

export async function updateBranchServiceById({
  id,
  payload,
}: {
  id: string;
  payload: UpdateBranchServiceRequest;
}) {
  const { data } = await api.put<BranchServiceEnvelopeResponse>(
    `/branch-service/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data; 
}

export async function deleteBranchServiceById(id: string) {
  await api.delete(`/branch-service/${encodeURIComponent(id)}`);
}
