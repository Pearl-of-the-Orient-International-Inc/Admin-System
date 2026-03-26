import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as officeTitleApi from "./office-title.api";
import type { OfficeTitleQueryParams } from "./office-title.types";

export const useOfficeTitlesQuery = (params: OfficeTitleQueryParams = {}) =>
  useQuery({
    queryKey: ["office-title", "list", params],
    queryFn: () => officeTitleApi.getOfficeTitles(params),
    staleTime: 30_000,
  });

export const useOfficeTitleByIdQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["office-title", "detail", id],
    queryFn: () => officeTitleApi.getOfficeTitleById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useCreateOfficeTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officeTitleApi.createOfficeTitle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["office-title", "list"] });
    },
    meta: { feature: "office-title.create" },
  });
};

export const useUpdateOfficeTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officeTitleApi.updateOfficeTitleById,
    onSuccess: async (updatedOfficeTitle) => {
      await queryClient.invalidateQueries({ queryKey: ["office-title", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["office-title", "detail", updatedOfficeTitle.id],
      });
    },
    meta: { feature: "office-title.update" },
  });
};

export const useDeleteOfficeTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officeTitleApi.deleteOfficeTitleById,
    onSuccess: async (_data, officeTitleId) => {
      await queryClient.invalidateQueries({ queryKey: ["office-title", "list"] });
      queryClient.removeQueries({
        queryKey: ["office-title", "detail", officeTitleId],
      });
    },
    meta: { feature: "office-title.delete" },
  });
};

export const useArchiveOfficeTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officeTitleApi.archiveOfficeTitleById,
    onSuccess: async (officeTitle) => {
      await queryClient.invalidateQueries({ queryKey: ["office-title", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["office-title", "detail", officeTitle.id],
      });
    },
    meta: { feature: "office-title.archive" },
  });
};

export const useRetrieveOfficeTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officeTitleApi.retrieveOfficeTitleById,
    onSuccess: async (officeTitle) => {
      await queryClient.invalidateQueries({ queryKey: ["office-title", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["office-title", "detail", officeTitle.id],
      });
    },
    meta: { feature: "office-title.retrieve" },
  });
};
