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
