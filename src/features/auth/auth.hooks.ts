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
  useMutation({
    mutationFn: authApi.logout,
    throwOnError: false,
    meta: { feature: "auth.logout" },
  });

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

export { toApiError };
