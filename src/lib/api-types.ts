import { UserType } from "@/enums";

export type ApiCode =
  | "OK"
  | "CREATED"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorIssue {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message?: string;
  errors?: ApiErrorIssue[];
  requiresVerification?: boolean;
  error?: unknown;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserType;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
}

export interface AuthSuccessResponse {
  code: string;
  message: string;
  user: UserPublic;
  accessToken: string;
  mfaRequired?: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface VerifyEmailResponse {
  code: string;
  message: string;
  user: UserPublic;
}

export interface UserEnvelopeResponse {
  user: UserPublic;
}
