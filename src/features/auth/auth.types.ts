import { UserType } from "@/enums";

export interface LoginRequest {
  email: string;
  password: string;
  userAgent?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserType;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
  token: string; // query param in backend
}

export interface VerifyEmailRequest {
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface VerifyPasswordRequest {
  oldPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export interface EnableTwoFactorRequest {
  token: string;
}

export interface VerifyTwoFactorRequest {
  mfaToken: string;
  token: string;
  userAgent?: string;
}

export interface PasskeyRegistrationOptionsRequest {
  label?: string;
}

export interface PasskeyAuthenticationOptionsRequest {
  email: string;
}

export interface PasskeyRegistrationVerifyRequest {
  response: unknown;
}

export interface PasskeyAuthenticationVerifyRequest {
  email: string;
  response: unknown;
  userAgent?: string;
}
