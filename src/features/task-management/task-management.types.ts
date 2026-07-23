import type { UserPublic } from "@/lib/api-types";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  progress: string;
  sortOrder: number;
  boardId: string;
  assigneeId: string | null;
  assignee: Pick<
    UserPublic,
    "id" | "name" | "email" | "avatar" | "position" | "accountStatus"
  > | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBoard {
  id: string;
  title: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  tasks: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskManagementResponse {
  code: string;
  message: string;
  data: { boards: TaskBoard[] };
}

export interface TaskBoardResponse {
  code: string;
  message: string;
  data: TaskBoard;
}

export interface TaskItemResponse {
  code: string;
  message: string;
  data: TaskItem;
}

export interface TaskBoardPayload {
  title: string;
  color: string;
}

export interface TaskPayload {
  title: string;
  boardId: string;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface TaskMovePayload {
  taskId: string;
  boardId: string;
  sortOrder?: number;
}

export interface TaskUpdatePayload {
  taskId: string;
  payload: TaskPayload;
}

export interface TaskManagementQueryParams {
  search?: string;
  priority?: TaskPriority;
}
