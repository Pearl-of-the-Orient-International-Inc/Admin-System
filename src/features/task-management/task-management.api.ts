import { api } from "@/lib/http-client";
import type {
  TaskBoardPayload,
  TaskBoardResponse,
  TaskItemResponse,
  TaskManagementQueryParams,
  TaskManagementResponse,
  TaskMovePayload,
  TaskPayload,
  TaskUpdatePayload,
} from "./task-management.types";

const basePath = "/task-management";

export async function getTaskManagement(params?: TaskManagementQueryParams) {
  const { data } = await api.get<TaskManagementResponse>(basePath, { params });
  return data;
}

export async function createTaskBoard(payload: TaskBoardPayload) {
  const { data } = await api.post<TaskBoardResponse>(`${basePath}/boards`, payload);
  return data;
}

export async function updateTaskBoard({
  boardId,
  payload,
}: {
  boardId: string;
  payload: TaskBoardPayload;
}) {
  const { data } = await api.put<TaskBoardResponse>(
    `${basePath}/boards/${encodeURIComponent(boardId)}`,
    payload,
  );
  return data;
}

export async function deleteTaskBoard(boardId: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/boards/${encodeURIComponent(boardId)}`,
  );
  return data;
}

export async function createTask(payload: TaskPayload) {
  const { data } = await api.post<TaskItemResponse>(`${basePath}/tasks`, payload);
  return data;
}

export async function updateTask({ taskId, payload }: TaskUpdatePayload) {
  const { data } = await api.put<TaskItemResponse>(
    `${basePath}/tasks/${encodeURIComponent(taskId)}`,
    payload,
  );
  return data;
}

export async function moveTask({ boardId, sortOrder, taskId }: TaskMovePayload) {
  const { data } = await api.patch<TaskItemResponse>(
    `${basePath}/tasks/${encodeURIComponent(taskId)}/move`,
    { boardId, sortOrder },
  );
  return data;
}

export async function deleteTask(taskId: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/tasks/${encodeURIComponent(taskId)}`,
  );
  return data;
}
