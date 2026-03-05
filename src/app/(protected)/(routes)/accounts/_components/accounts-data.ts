import { UserAccountStatus, UserPosition, UserType } from "@/enums";

export type AccountRecord = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  role: UserType.ADMIN | UserType.OFFICER;
  position: UserPosition | null;
  status: UserAccountStatus;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  lastSignInAt: string;
};

export const accountPositionOptions: UserPosition[] = [
  UserPosition.CLERK,
  UserPosition.HR,
  UserPosition.IT,
  UserPosition.ACCOUNTING_FINANCE,
  UserPosition.OPERATIONS,
  UserPosition.SECRETARIAT,
];

export const formatAccountStatus = (status: UserAccountStatus): string => {
  if (status === UserAccountStatus.ACTIVE) return "Active";
  if (status === UserAccountStatus.PENDING) return "Pending";
  return "Suspended";
};

export const formatPositionLabel = (position: UserPosition | null): string => {
  if (!position) return "Not set";

  return position
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join("/")
    .toUpperCase();
};
