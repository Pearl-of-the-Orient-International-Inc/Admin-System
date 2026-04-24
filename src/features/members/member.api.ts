import { api } from "@/lib/http-client";
import type {
  CreateMemberByAdminResponse,
  MemberEnvelopeResponse,
  MemberListResponse,
  MembershipReportResponse,
} from "@/lib/api-types";
import type {
  CreateMemberByAdminRequest,
  MembershipReportQueryParams,
  MembersQueryParams,
  UpdateMemberByAdminRequest,
  UpdateMemberStatusRequest,
} from "./member.types";

export async function getMembers(params: MembersQueryParams = {}) {
  const { data } = await api.get<MemberListResponse>("/members", { params });
  return data;
}

export async function getPendingMembers(params: MembersQueryParams = {}) {
  const { data } = await api.get<MemberListResponse>("/members/pending", { params });
  return data;
}

export async function getMembershipReport(
  params: MembershipReportQueryParams = {},
) {
  const { data } = await api.get<MembershipReportResponse>(
    "/members/reports/membership",
    { params },
  );
  return data.data;
}

export async function getMemberById(memberId: string) {
  const { data } = await api.get<MemberEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}`,
  );
  return data.data;
}

export async function createMember(payload: CreateMemberByAdminRequest) {
  const { data } = await api.post<CreateMemberByAdminResponse>("/members", payload);
  return data.data;
}

export async function updateMemberById({
  memberId,
  payload,
}: {
  memberId: string;
  payload: UpdateMemberByAdminRequest;
}) {
  const { data } = await api.put<MemberEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}`,
    payload,
  );
  return data.data;
}

export async function updateMemberStatus({
  memberId,
  status,
}: UpdateMemberStatusRequest) {
  const { data } = await api.patch<MemberEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/status`,
    { status },
  );
  return data.data;
}

export async function archiveMember(memberId: string) {
  const { data } = await api.patch<MemberEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/archive`,
  );
  return data.data;
}

export async function retrieveMember(memberId: string) {
  const { data } = await api.patch<MemberEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/retrieve`,
  );
  return data.data;
}
