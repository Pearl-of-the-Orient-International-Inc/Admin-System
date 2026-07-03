import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as memberApi from "./member.api";
import type {
  MembershipReportQueryParams,
  MembersQueryParams,
} from "./member.types";

export const useMembersQuery = (params: MembersQueryParams = {}) =>
  useQuery({
    queryKey: ["members", "list", params],
    queryFn: () => memberApi.getMembers(params),
    staleTime: 30_000,
  });

export const usePendingMembersQuery = (params: MembersQueryParams = {}) =>
  useQuery({
    queryKey: ["members", "pending", params],
    queryFn: () => memberApi.getPendingMembers(params),
    staleTime: 30_000,
  });

export const useMembershipReportQuery = (
  params: MembershipReportQueryParams = {},
) =>
  useQuery({
    queryKey: ["members", "report", "membership", params],
    queryFn: () => memberApi.getMembershipReport(params),
    staleTime: 30_000,
  });

export const useMemberByIdQuery = (memberId: string, enabled = true) =>
  useQuery({
    queryKey: ["members", "detail", memberId],
    queryFn: () => memberApi.getMemberById(memberId),
    enabled: Boolean(memberId) && enabled,
    staleTime: 30_000,
  });

export const useCreateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.createMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.create" },
  });
};

export const useUpdateMemberStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.updateMemberStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.status.update" },
  });
};

export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.updateMemberById,
    onSuccess: async (updatedMember) => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({
        queryKey: ["members", "detail", updatedMember.id],
      });
    },
    meta: { feature: "members.update" },
  });
};

export const useUpdateMemberUniqueIdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.updateMemberUniqueId,
    onSuccess: async (updatedMember) => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({
        queryKey: ["members", "detail", updatedMember.id],
      });
    },
    meta: { feature: "members.unique-id.update" },
  });
};

export const useChangeMemberPasswordByAdminMutation = () =>
  useMutation({
    mutationFn: memberApi.changeMemberPasswordByAdmin,
    meta: { feature: "members.password.update" },
  });

export const useVerifyMemberEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.verifyMemberEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.email.verify" },
  });
};

export const useSendRenewalEmailMutation = () =>
  useMutation({
    mutationFn: memberApi.sendRenewalEmail,
    meta: { feature: "members.renewal.email" },
  });

export const useDeleteMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.deleteMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.delete" },
  });
};

export const useArchiveMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.archiveMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.archive" },
  });
};

export const useRetrieveMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.retrieveMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    meta: { feature: "members.retrieve" },
  });
};
