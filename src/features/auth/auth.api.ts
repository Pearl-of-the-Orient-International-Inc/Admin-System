import { api } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import type {
  AuthSuccessResponse,
  PasskeyOptionsResponse,
  PasskeyStatusResponse,
  RefreshTokenResponse,
  UserSessionsResponse,
  TwoFactorSetupResponse,
  UserEnvelopeResponse,
  VerifyEmailResponse,
} from "@/lib/api-types";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyPasswordRequest,
  ResendVerificationRequest,
  EnableTwoFactorRequest,
  VerifyTwoFactorRequest,
  PasskeyRegistrationOptionsRequest,
  PasskeyAuthenticationOptionsRequest,
  PasskeyRegistrationVerifyRequest,
  PasskeyAuthenticationVerifyRequest,
} from "./auth.types";

export async function login(payload: LoginRequest) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/login", payload);
  if (data.accessToken && !data.mfaRequired) {
    authStore.setAccessToken(data.accessToken);
  }
  return data;
}

export async function register(payload: RegisterRequest) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/register", payload);
  authStore.setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  try {
    await api.delete("/auth/logout");
  } finally {
    authStore.clear();
  }
}

export async function refreshToken() {
  const { data } = await api.get<RefreshTokenResponse>("/auth/refresh-token");
  authStore.setAccessToken(data.accessToken);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  await api.post("/auth/forgot-password", payload);
}

export async function resetPassword(payload: ResetPasswordRequest) {
  const { token, ...body } = payload;
  await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}`, body);
}

export async function verifyEmail(payload: VerifyEmailRequest) {
  const { data } = await api.post<VerifyEmailResponse>("/auth/verify-email", payload);
  return data;
}

export async function resendEmailVerification(payload: ResendVerificationRequest) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/resend-email-verification", payload);
  if (data.accessToken) authStore.setAccessToken(data.accessToken);
  return data;
}

export async function verifyPassword(payload: VerifyPasswordRequest) {
  await api.post("/auth/verify-password", payload);
}

export async function changePassword(payload: ChangePasswordRequest) {
  await api.post("/auth/change-password", payload);
}

export async function getCurrentUser() {
  const { data } = await api.get<UserEnvelopeResponse>("/users/current");
  return data.user;
}

export async function setupTwoFactor() {
  const { data } = await api.post<TwoFactorSetupResponse>("/auth/two-factor/setup");
  return data;
}

export async function enableTwoFactor(payload: EnableTwoFactorRequest) {
  await api.post("/auth/two-factor/enable", payload);
}

export async function disableTwoFactor() {
  await api.post("/auth/two-factor/disable");
}

export async function verifyTwoFactor(payload: VerifyTwoFactorRequest) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/verify-two-factor", payload);
  if (data.accessToken) {
    authStore.setAccessToken(data.accessToken);
  }
  return data;
}

export async function deleteCurrentUser() {
  try {
    await api.delete("/users/current");
  } finally {
    authStore.clear();
  }
}

export async function getPasskeyStatus() {
  const { data } = await api.get<PasskeyStatusResponse>("/auth/passkey/status");
  return data.data;
}

export async function getPasskeyRegistrationOptions(
  payload: PasskeyRegistrationOptionsRequest = {},
) {
  const { data } = await api.post<PasskeyOptionsResponse>(
    "/auth/passkey/register/options",
    payload,
  );
  return data.data;
}

export async function verifyPasskeyRegistration(
  payload: PasskeyRegistrationVerifyRequest,
) {
  await api.post("/auth/passkey/register/verify", payload);
}

export async function getPasskeyAuthenticationOptions(
  payload: PasskeyAuthenticationOptionsRequest,
) {
  const { data } = await api.post<PasskeyOptionsResponse>(
    "/auth/passkey/authenticate/options",
    payload,
  );
  return data.data;
}

export async function verifyPasskeyAuthentication(
  payload: PasskeyAuthenticationVerifyRequest,
) {
  const { data } = await api.post<AuthSuccessResponse>(
    "/auth/passkey/authenticate/verify",
    payload,
  );

  if (data.accessToken) {
    authStore.setAccessToken(data.accessToken);
  }

  return data;
}

export async function getUserSessions() {
  const { data } = await api.get<UserSessionsResponse>("/users/sessions");
  return data.data;
}

export async function revokeSession(sessionId: string) {
  await api.delete(`/users/sessions/${encodeURIComponent(sessionId)}`);
}

export async function revokeOtherSessions() {
  await api.delete("/users/sessions/others");
}
