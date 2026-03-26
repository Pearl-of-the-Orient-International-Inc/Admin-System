import { api } from "@/lib/http-client";
import type {
  CreateOfficerAssignmentRequest,
  OfficerAssignmentEnvelopeResponse,
  OfficerAssignmentListResponse,
  OfficerAssignmentsQueryParams,
  ReplaceOfficerAssignmentRequest,
} from "./officer-assignment.types";

export async function createOfficerAssignmentByMemberId({
  memberId,
  payload,
}: {
  memberId: string;
  payload: CreateOfficerAssignmentRequest;
}) {
  const { data } = await api.post<OfficerAssignmentEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/officer-assignments`,
    payload,
  );
  return data.data;
}

export async function getOfficerAssignments(params: OfficerAssignmentsQueryParams = {}) {
  const { data } = await api.get<OfficerAssignmentListResponse>(
    "/members/officer-assignments",
    { params },
  );
  return data.data;
}

export async function getOfficerAssignmentsByMemberId(memberId: string) {
  const { data } = await api.get<OfficerAssignmentListResponse>(
    `/members/${encodeURIComponent(memberId)}/officer-assignments`,
  );
  return data.data;
}

export async function deactivateOfficerAssignmentByMemberId({
  memberId,
  assignmentId,
}: {
  memberId: string;
  assignmentId: string;
}) {
  const { data } = await api.patch<OfficerAssignmentEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/officer-assignments/${encodeURIComponent(
      assignmentId,
    )}/deactivate`,
  );
  return data.data;
}

export async function replaceOfficerAssignmentByMemberId({
  memberId,
  assignmentId,
  payload,
}: {
  memberId: string;
  assignmentId: string;
  payload: ReplaceOfficerAssignmentRequest;
}) {
  const { data } = await api.post<OfficerAssignmentEnvelopeResponse>(
    `/members/${encodeURIComponent(memberId)}/officer-assignments/${encodeURIComponent(
      assignmentId,
    )}/replace`,
    payload,
  );
  return data.data;
}
