import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventApi from "./event.api";
import { uploadEventThumbnail } from "./event-upload.api";
import type { EventQueryParams } from "./event.types";

export const useEventsQuery = (params: EventQueryParams = {}) =>
  useQuery({
    queryKey: ["events", "list", params],
    queryFn: () => eventApi.getEvents(params),
    staleTime: 30_000,
  });

export const useEventByIdQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["events", "detail", id],
    queryFn: () => eventApi.getEventById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useEventAttendeesQuery = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: ["events", "attendees", eventId],
    queryFn: () => eventApi.getEventAttendees(eventId),
    enabled: Boolean(eventId) && enabled,
    staleTime: 30_000,
  });

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events", "list"] });
    },
    meta: { feature: "events.create" },
  });
};

export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventApi.updateEventById,
    onSuccess: async (updatedEvent) => {
      await queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["events", "detail", updatedEvent.id],
      });
    },
    meta: { feature: "events.update" },
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventApi.deleteEventById,
    onSuccess: async (_data, eventId) => {
      await queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      queryClient.removeQueries({
        queryKey: ["events", "detail", eventId],
      });
    },
    meta: { feature: "events.delete" },
  });
};

export const useCancelEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventApi.cancelEventById,
    onSuccess: async (updatedEvent) => {
      await queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["events", "detail", updatedEvent.id],
      });
    },
    meta: { feature: "events.cancel" },
  });
};

export const useInviteEventAttendeesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventApi.inviteEventAttendees,
    onSuccess: async (_attendees, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["events", "attendees", variables.eventId],
      });
    },
    meta: { feature: "events.inviteAttendees" },
  });
};

export const useUploadEventThumbnailMutation = () =>
  useMutation({
    mutationFn: uploadEventThumbnail,
    meta: { feature: "events.uploadThumbnail" },
  });
