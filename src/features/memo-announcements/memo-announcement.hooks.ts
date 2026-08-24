import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as memoApi from "./memo-announcement.api";
import type { MemoAnnouncementQueryParams } from "./memo-announcement.types";

export const useMemoAnnouncementsQuery = (
  params: MemoAnnouncementQueryParams = {},
) =>
  useQuery({
    queryKey: ["memo-announcements", "list", params],
    queryFn: () => memoApi.getMemoAnnouncements(params),
    staleTime: 30_000,
  });

export const useMemoAnnouncementByIdQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["memo-announcements", "detail", id],
    queryFn: () => memoApi.getMemoAnnouncementById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useMemoRecipientSearchQuery = (search: string) =>
  useQuery({
    queryKey: ["memo-announcements", "recipients", search],
    queryFn: () => memoApi.searchMemoRecipients(search),
    staleTime: 30_000,
  });

export const useCreateMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.createMemoAnnouncement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
    },
    meta: { feature: "memoAnnouncements.create" },
  });
};

export const useUpdateMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.updateMemoAnnouncementById,
    onSuccess: async (memo) => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "detail", memo.id],
      });
    },
    meta: { feature: "memoAnnouncements.update" },
  });
};

export const usePublishMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.publishMemoAnnouncement,
    onSuccess: async (memo) => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "detail", memo.id],
      });
    },
    meta: { feature: "memoAnnouncements.publish" },
  });
};

export const useDeleteMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.deleteMemoAnnouncementById,
    onSuccess: async (_data, memoId) => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
      queryClient.removeQueries({
        queryKey: ["memo-announcements", "detail", memoId],
      });
    },
    meta: { feature: "memoAnnouncements.delete" },
  });
};

export const useArchiveMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.archiveMemoAnnouncementById,
    onSuccess: async (memo) => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "detail", memo.id],
      });
    },
    meta: { feature: "memoAnnouncements.archive" },
  });
};

export const useRestoreMemoAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoApi.restoreMemoAnnouncementById,
    onSuccess: async (memo) => {
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["memo-announcements", "detail", memo.id],
      });
    },
    meta: { feature: "memoAnnouncements.restore" },
  });
};
