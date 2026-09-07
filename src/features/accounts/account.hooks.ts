import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as accountApi from "./account.api";

export const useAccountsQuery = () =>
  useQuery({
    queryKey: ["accounts", "list"],
    queryFn: accountApi.getAccounts,
    staleTime: 30_000,
  });

export const useAccountByIdQuery = (userId: string, enabled = true) =>
  useQuery({
    queryKey: ["accounts", "detail", userId],
    queryFn: () => accountApi.getAccountById(userId),
    enabled: Boolean(userId) && enabled,
    staleTime: 30_000,
  });

export const useCreateAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.createAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
    },
    meta: { feature: "accounts.create" },
  });
};

export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.updateAccountById,
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["accounts", "detail", updatedUser.id],
      });
    },
    meta: { feature: "accounts.update" },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.deleteAccountById,
    onSuccess: async (_data, userId) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
      queryClient.removeQueries({ queryKey: ["accounts", "detail", userId] });
    },
    meta: { feature: "accounts.delete" },
  });
};

export const useChangeAccountPasswordMutation = () =>
  useMutation({
    mutationFn: accountApi.changeAccountPassword,
    meta: { feature: "accounts.changePassword" },
  });

export const useResendAccountEmailVerificationMutation = () =>
  useMutation({
    mutationFn: accountApi.resendAccountEmailVerification,
    meta: { feature: "accounts.resendEmailVerification" },
  });

export const useVerifyAccountEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.verifyAccountEmail,
    onSuccess: async (_data, userId) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["accounts", "detail", userId],
      });
    },
    meta: { feature: "accounts.verifyEmail" },
  });
};
