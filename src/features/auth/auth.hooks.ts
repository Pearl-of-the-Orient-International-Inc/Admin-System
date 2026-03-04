import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toApiError } from "@/lib/http-client";
import * as authApi from "./auth.api";
import { uploadAvatar } from "./avatar-upload.api";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: authApi.login,
    throwOnError: false,
    meta: { feature: "auth.login" },
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: authApi.register,
    throwOnError: false,
    meta: { feature: "auth.register" },
  });

export const useLogoutMutation = () =>
  {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: authApi.logout,
      throwOnError: false,
      onSettled: async () => {
        await queryClient.cancelQueries({ queryKey: ["auth"] });
        queryClient.removeQueries({ queryKey: ["auth"] });
      },
      meta: { feature: "auth.logout" },
    });
  };

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: authApi.forgotPassword,
    throwOnError: false,
    meta: { feature: "auth.forgotPassword" },
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: authApi.resetPassword,
    throwOnError: false,
    meta: { feature: "auth.resetPassword" },
  });

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationFn: authApi.verifyEmail,
    throwOnError: false,
    meta: { feature: "auth.verifyEmail" },
  });

export const useResendEmailVerificationMutation = () =>
  useMutation({
    mutationFn: authApi.resendEmailVerification,
    throwOnError: false,
    meta: { feature: "auth.resendEmailVerification" },
  });

export const useVerifyPasswordMutation = () =>
  useMutation({
    mutationFn: authApi.verifyPassword,
    throwOnError: false,
    meta: { feature: "auth.verifyPassword" },
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: authApi.changePassword,
    throwOnError: false,
    meta: { feature: "auth.changePassword" },
  });

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: authApi.getCurrentUser,
    staleTime: 60_000,
  });

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    meta: { feature: "auth.uploadAvatar" },
  });
};

export const useSetupTwoFactorMutation = () =>
  useMutation({
    mutationFn: authApi.setupTwoFactor,
    throwOnError: false,
    meta: { feature: "auth.setupTwoFactor" },
  });

export const useEnableTwoFactorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.enableTwoFactor,
    throwOnError: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    meta: { feature: "auth.enableTwoFactor" },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.disableTwoFactor,
    throwOnError: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    meta: { feature: "auth.disableTwoFactor" },
  });
};

export const useVerifyTwoFactorMutation = () =>
  useMutation({
    mutationFn: authApi.verifyTwoFactor,
    throwOnError: false,
    meta: { feature: "auth.verifyTwoFactor" },
  });

export const useDeleteCurrentUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deleteCurrentUser,
    throwOnError: false,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
    meta: { feature: "auth.deleteCurrentUser" },
  });
};

export const usePasskeyStatusQuery = () =>
  useQuery({
    queryKey: ["auth", "passkey-status"],
    queryFn: authApi.getPasskeyStatus,
    staleTime: 60_000,
  });

export const usePasskeyRegistrationOptionsMutation = () =>
  useMutation({
    mutationFn: authApi.getPasskeyRegistrationOptions,
    throwOnError: false,
    meta: { feature: "auth.passkey.registrationOptions" },
  });

export const usePasskeyRegistrationVerifyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyPasskeyRegistration,
    throwOnError: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "passkey-status"] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    meta: { feature: "auth.passkey.registrationVerify" },
  });
};

export const usePasskeyAuthenticationOptionsMutation = () =>
  useMutation({
    mutationFn: authApi.getPasskeyAuthenticationOptions,
    throwOnError: false,
    meta: { feature: "auth.passkey.authenticationOptions" },
  });

export const usePasskeyAuthenticationVerifyMutation = () =>
  useMutation({
    mutationFn: authApi.verifyPasskeyAuthentication,
    throwOnError: false,
    meta: { feature: "auth.passkey.authenticationVerify" },
  });

export { toApiError };
