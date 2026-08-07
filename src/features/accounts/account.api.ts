import { api } from "@/lib/http-client";
import type {
  CreateUserAccountResponse,
  UserEnvelopeResponse,
  UserListResponse,
} from "@/lib/api-types";
import type {
  ChangeAccountPasswordRequest,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "./account.types";

export async function getAccounts() {
  const { data } = await api.get<UserListResponse>("/users");
  return data.users;
}

export async function getAccountById(userId: string) {
  const { data } = await api.get<UserEnvelopeResponse>(`/users/${encodeURIComponent(userId)}`);
  return data.user;
}

export async function createAccount(payload: CreateAccountRequest) {
  const { data } = await api.post<CreateUserAccountResponse>("/users", payload);
  return data.user;
}

export async function updateAccountById({
  userId,
  payload,
}: {
  userId: string;
  payload: UpdateAccountRequest;
}) {
  const { data } = await api.put<CreateUserAccountResponse>(
    `/users/${encodeURIComponent(userId)}`,
    payload,
  );
  return data.user;
}

export async function deleteAccountById(userId: string) {
  await api.delete(`/users/${encodeURIComponent(userId)}`);
}

export async function changeAccountPassword({
  userId,
  password,
  confirmPassword,
}: ChangeAccountPasswordRequest) {
  await api.post(`/users/${encodeURIComponent(userId)}/change-password`, {
    password,
    confirmPassword,
  });
}

export async function resendAccountEmailVerification(userId: string) {
  await api.post(
    `/users/${encodeURIComponent(userId)}/resend-email-verification`,
  );
}
