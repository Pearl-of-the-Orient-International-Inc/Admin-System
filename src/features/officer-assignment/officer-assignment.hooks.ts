import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as officerAssignmentApi from "./officer-assignment.api";

export const useAllOfficerAssignmentsQuery = (
  params: { activeOnly?: boolean } = {},
) =>
  useQuery({
    queryKey: ["officer-assignments", "list", params],
    queryFn: () => officerAssignmentApi.getOfficerAssignments(params),
    staleTime: 30_000,
  });

export const useMemberOfficerAssignmentsQuery = (
  memberId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["officer-assignments", "member", memberId],
    queryFn: () => officerAssignmentApi.getOfficerAssignmentsByMemberId(memberId),
    enabled: Boolean(memberId) && enabled,
    staleTime: 30_000,
  });

export const useCreateOfficerAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officerAssignmentApi.createOfficerAssignmentByMemberId,
    onSuccess: async (_assignment, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({
        queryKey: ["members", "detail", variables.memberId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["officer-assignments"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["officer-assignments", "member", variables.memberId],
      });
    },
    meta: { feature: "officer-assignment.create" },
  });
};

export const useDeactivateOfficerAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officerAssignmentApi.deactivateOfficerAssignmentByMemberId,
    onSuccess: async (_assignment, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["officer-assignments"] });
      await queryClient.invalidateQueries({
        queryKey: ["officer-assignments", "member", variables.memberId],
      });
    },
    meta: { feature: "officer-assignment.deactivate" },
  });
};

export const useReplaceOfficerAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officerAssignmentApi.replaceOfficerAssignmentByMemberId,
    onSuccess: async (_assignment, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["officer-assignments"] });
      await queryClient.invalidateQueries({
        queryKey: ["officer-assignments", "member", variables.memberId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["officer-assignments", "member", variables.payload.replacementMemberId],
      });
    },
    meta: { feature: "officer-assignment.replace" },
  });
};
