import type {
  SystemLogActionType,
  SystemLogRecord,
  SystemLogResult,
} from "./system-log.types";

export function formatSystemLogDate(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSystemLogActionType(actionType: SystemLogActionType) {
  if (actionType === "AUTH") return "Authentication";
  if (actionType === "CREATE") return "Create";
  if (actionType === "UPDATE") return "Update";
  if (actionType === "DELETE") return "Delete";
  if (actionType === "EXPORT") return "Export";
  if (actionType === "INVITE") return "Invite";
  if (actionType === "ASSIGN") return "Assign";
  if (actionType === "REVIEW") return "Review";
  return "Security";
}

export function formatSystemLogResult(result: SystemLogResult) {
  if (result === "SUCCESS") return "Success";
  if (result === "WARNING") return "Warning";
  return "Failed";
}

export function getSystemLogSummary(logs: SystemLogRecord[]) {
  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;

  return {
    total: logs.length,
    successful: logs.filter((log) => log.result === "SUCCESS").length,
    warnings: logs.filter((log) => log.result === "WARNING").length,
    failed: logs.filter((log) => log.result === "FAILED").length,
    recent: logs.filter((log) => new Date(log.timestamp).getTime() >= last24Hours)
      .length,
    uniqueUsers: new Set(logs.map((log) => log.actorId)).size,
  };
}
