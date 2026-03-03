import { api } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import type {
  AuthSuccessResponse,
  RefreshTokenResponse,
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
} from "./auth.types";

export async function login(payload: LoginRequest) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/login", payload);
  authStore.setAccessToken(data.accessToken);
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
