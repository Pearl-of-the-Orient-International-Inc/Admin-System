export type SystemLogResult = "SUCCESS" | "WARNING" | "FAILED";

export type SystemLogActionType =
  | "AUTH"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "INVITE"
  | "ASSIGN"
  | "REVIEW"
  | "SECURITY";

export type SystemLogRecord = {
  id: string;
  actorId: string;
  userId?: string | null;
  actorName: string;
  actorEmail: string;
  actorAvatar?: string | null;
  actionType: SystemLogActionType;
  actionLabel: string;
  moduleLabel: string;
  targetLabel: string;
  description: string;
  result: SystemLogResult;
  timestamp: string;
  ipAddress: string;
  deviceLabel: string;
  metadata?: string[];
};

export type SystemLogListResponse = {
  code: string;
  message: string;
  data: SystemLogRecord[];
};
