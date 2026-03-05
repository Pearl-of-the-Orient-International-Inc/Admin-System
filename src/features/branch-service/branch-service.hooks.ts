import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as branchServiceApi from "./branch-service.api";
import type { BranchServiceQueryParams } from "./branch-service.types";

export const useBranchServicesQuery = (params: BranchServiceQueryParams = {}) =>
  useQuery({
    queryKey: ["branch-service", "list", params],
    queryFn: () => branchServiceApi.getBranchServices(params),
    staleTime: 30_000,
  });

export const useBranchServiceByIdQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["branch-service", "detail", id],
    queryFn: () => branchServiceApi.getBranchServiceById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useCreateBranchServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: branchServiceApi.createBranchService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branch-service", "list"] });
    },
    meta: { feature: "branch-service.create" },
  });
};

export const useUpdateBranchServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: branchServiceApi.updateBranchServiceById,
    onSuccess: async (updatedBranchService) => {
      await queryClient.invalidateQueries({ queryKey: ["branch-service", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["branch-service", "detail", updatedBranchService.id],
      });
    },
    meta: { feature: "branch-service.update" },
  });
};

export const useDeleteBranchServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: branchServiceApi.deleteBranchServiceById,
    onSuccess: async (_data, branchServiceId) => {
      await queryClient.invalidateQueries({ queryKey: ["branch-service", "list"] });
      queryClient.removeQueries({
        queryKey: ["branch-service", "detail", branchServiceId],
      });
    },
    meta: { feature: "branch-service.delete" },
  });
};
