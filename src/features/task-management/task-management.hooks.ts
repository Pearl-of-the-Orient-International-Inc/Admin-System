import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as taskApi from "./task-management.api";
import type { TaskManagementQueryParams } from "./task-management.types";

const rootKey = ["task-management"] as const;

export const useTaskManagementQuery = (
  params: TaskManagementQueryParams = {},
) =>
  useQuery({
    queryKey: [...rootKey, "board", params],
    queryFn: () => taskApi.getTaskManagement(params),
    staleTime: 30_000,
  });

export const useCreateTaskBoardMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.createTaskBoard,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.createBoard" },
  });
};

export const useUpdateTaskBoardMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.updateTaskBoard,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.updateBoard" },
  });
};

export const useDeleteTaskBoardMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.deleteTaskBoard,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.deleteBoard" },
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.createTask" },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.updateTask,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.updateTask" },
  });
};

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.moveTask,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.moveTask" },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "taskManagement.deleteTask" },
  });
};
