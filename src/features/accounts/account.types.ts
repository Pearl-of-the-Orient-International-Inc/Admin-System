import { UserAccountStatus, UserPosition, UserType } from "@/enums";

export interface CreateAccountRequest {
  name: string;
  email: string;
  password: string;
  role: UserType.ADMIN | UserType.OFFICER;
  position: UserPosition;
  accountStatus?: UserAccountStatus;
  avatar?: string | null;
  isTwoFactorEnabled?: boolean;
  notes?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  email?: string;
  role?: UserType.ADMIN | UserType.OFFICER;
  position?: UserPosition;
  accountStatus?: UserAccountStatus;
  avatar?: string | null;
  isTwoFactorEnabled?: boolean;
  notes?: string;
}
