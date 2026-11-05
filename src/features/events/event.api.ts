import { api } from "@/lib/http-client";
import type {
  CreateEventRequest,
  EventAttendeesResponse,
  EventEnvelopeResponse,
  EventAttendeeResource,
  EventListResponse,
  EventQueryParams,
  InviteEventAttendeesRequest,
  ReviewEventAttendeeStatus,
  UpdateEventRequest,
} from "./event.types";

export async function getEvents(params: EventQueryParams = {}) {
  const { data } = await api.get<EventListResponse>("/events", {
    params,
  });

  return {
    items: data.data,
    pagination: data.pagination,
    code: data.code,
    message: data.message,
  };
}

export async function getEventById(id: string) {
  const { data } = await api.get<EventEnvelopeResponse>(
    `/events/${encodeURIComponent(id)}`,
  );
  return data.data;
}

export async function createEvent(payload: CreateEventRequest) {
  const { data } = await api.post<EventEnvelopeResponse>("/events/create", payload);
  return data.data;
}

export async function updateEventById({
  id,
  payload,
}: {
  id: string;
  payload: UpdateEventRequest;
}) {
  const { data } = await api.put<EventEnvelopeResponse>(
    `/events/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data;
}

export async function deleteEventById(id: string) {
  await api.delete(`/events/${encodeURIComponent(id)}`);
}

export async function cancelEventById(id: string) {
  const { data } = await api.patch<EventEnvelopeResponse>(
    `/events/${encodeURIComponent(id)}/cancel`,
  );
  return data.data;
}

export async function getEventAttendees(eventId: string) {
  const { data } = await api.get<EventAttendeesResponse>(
    `/events/${encodeURIComponent(eventId)}/attendees`,
  );
  return data.data;
}

export async function inviteEventAttendees({
  eventId,
  memberIds,
}: InviteEventAttendeesRequest) {
  const { data } = await api.post<EventAttendeesResponse>(
    `/events/${encodeURIComponent(eventId)}/attendees`,
    { memberIds },
  );
  return data.data;
}

export async function reviewEventAttendee({
  eventId,
  attendeeId,
  status,
}: {
  eventId: string;
  attendeeId: string;
  status: ReviewEventAttendeeStatus;
}) {
  const { data } = await api.patch<{
    code: string;
    message: string;
    data: EventAttendeeResource;
  }>(
    `/events/${encodeURIComponent(eventId)}/attendees/${encodeURIComponent(attendeeId)}/status`,
    { status },
  );
  return data.data;
}

export async function getEventCertificateEligibleAttendees(eventId: string) {
  const { data } = await api.get<{
    code: string;
    message: string;
    data: Array<{ id: string; memberId: string }>;
  }>(`/events/${encodeURIComponent(eventId)}/certificate-eligible-attendees`);
  return data;
}
