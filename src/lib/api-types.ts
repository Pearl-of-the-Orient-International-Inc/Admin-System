import { UserAccountStatus, UserPosition, UserType } from "@/enums";

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
  position?: UserPosition | null;
  accountStatus?: UserAccountStatus;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorSetupResponse {
  code: string;
  message: string;
  data: TwoFactorSetupData;
}

export interface PasskeyStatusResponse {
  code: string;
  message: string;
  data: {
    hasPasskey: boolean;
    count: number;
  };
}

export interface PasskeyOptionsResponse<TOptions = unknown> {
  code: string;
  message: string;
  data: {
    options: TOptions;
    label?: string | null;
  };
}

export interface UserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiredAt: string;
  isCurrent: boolean;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
    label: string;
    coordinates: {
      lat: number;
      lng: number;
    } | null;
  };
}

export interface UserSessionsResponse {
  code: string;
  message: string;
  data: {
    currentSession: UserSession | null;
    sessions: UserSession[];
  };
}

export interface AuthSuccessResponse {
  code: string;
  message: string;
  user: UserPublic;
  accessToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
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

export interface UserListResponse {
  total: number;
  users: UserPublic[];
  limit?: number;
  offset?: number;
  totalPages?: number;
  currentPage?: number;
  hasMore?: boolean;
}

export interface CreateUserAccountResponse {
  code: ApiCode;
  message: string;
  user: UserPublic;
}
