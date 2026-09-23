import { api } from "@/lib/http-client";
import type { ChaplainServiceBookingListResponse, ChaplainServiceListResponse, ChaplainServicePayload, ChaplainServiceResponse, UpdateChaplainServiceBookingFinancialsPayload, UpdateChaplainServiceBookingStatusPayload } from "./chaplain-service.types";

export async function getChaplainServices() {
  const { data } = await api.get<ChaplainServiceListResponse>("/chaplain-services");
  return data;
}

export async function createChaplainService(payload: ChaplainServicePayload) {
  const { data } = await api.post<ChaplainServiceResponse>("/chaplain-services", payload);
  return data.data;
}

export async function updateChaplainService({ id, payload }: { id: string; payload: ChaplainServicePayload }) {
  const { data } = await api.put<ChaplainServiceResponse>(`/chaplain-services/${encodeURIComponent(id)}`, payload);
  return data.data;
}

export async function getChaplainServiceBookings() {
  const { data } = await api.get<ChaplainServiceBookingListResponse>(
    "/chaplain-services/bookings",
  );
  return data;
}

export async function updateChaplainServiceBookingStatus({
  id,
  payload,
}: {
  id: string;
  payload: UpdateChaplainServiceBookingStatusPayload;
}) {
  const { data } = await api.patch(
    `/chaplain-services/bookings/${encodeURIComponent(id)}/status`,
    payload,
  );
  return data.data;
}

export async function updateChaplainServiceBookingFinancials({
  id,
  payload,
}: {
  id: string;
  payload: UpdateChaplainServiceBookingFinancialsPayload;
}) {
  const { data } = await api.patch(
    `/chaplain-services/bookings/${encodeURIComponent(id)}/financials`,
    payload,
  );
  return data.data;
}
