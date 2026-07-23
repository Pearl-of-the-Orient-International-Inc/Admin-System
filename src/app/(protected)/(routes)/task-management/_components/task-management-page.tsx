"use client";

import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  CheckSquare,
  Circle,
  Clock3,
  GripVertical,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPosition } from "@/enums";
import { useAccountsQuery } from "@/features/accounts/account.hooks";
import {
  useCreateTaskBoardMutation,
  useCreateTaskMutation,
  useDeleteTaskBoardMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useTaskManagementQuery,
  useUpdateTaskBoardMutation,
  useUpdateTaskMutation,
} from "@/features/task-management/task-management.hooks";
import type {
  TaskBoard,
  TaskItem,
  TaskPriority,
} from "@/features/task-management/task-management.types";
import { useToast } from "@/hooks/use-toast";
import type { UserPublic } from "@/lib/api-types";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

type TaskStatus = string;
type BoardColumnRecord = TaskBoard;
type TaskForm = {
  assigneeId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
};
type BoardForm = {
  color: string;
  title: string;
};

const defaultForm = (status: TaskStatus = ""): TaskForm => ({
  assigneeId: "",
  dueDate: "",
  priority: "MEDIUM",
  status,
  title: "",
});
const defaultBoardForm = (): BoardForm => ({
  color: "#047857",
  title: "",
});
const priorityVariant = {
  HIGH: "error",
  LOW: "secondary",
  MEDIUM: "warning",
} as const;
const priorityLabels: Record<TaskPriority, string> = {
  HIGH: "High",
  LOW: "Low",
  MEDIUM: "Medium",
};
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NA"
  );
};
const formatPosition = (position: string) =>
  position
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

function TaskCard({
  columns,
  onDelete,
  onEdit,
  onMove,
  task,
}: {
  columns: BoardColumnRecord[];
  onDelete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  task: TaskItem;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "gap-3 rounded-md border bg-background p-3 shadow-xs transition hover:border-emerald-200 hover:shadow-sm",
        isDragging && "z-10 opacity-70 ring-2 ring-emerald-500",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
          <span className="sr-only">Drag task</span>
        </button>
        <CheckSquare className="mt-0.5 size-4 shrink-0 text-sky-500" />
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
          {task.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open task actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="size-4" />
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              <Trash2 className="size-4" />
              Delete task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.id}
                disabled={column.id === task.boardId}
                onClick={() => onMove(task.id, column.id)}
              >
                Move to {column.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{task.code}</span>
        <div className="flex items-center gap-2">
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-red-50 px-1.5 py-0.5 font-semibold text-red-700">
              <Clock3 className="size-3" />
              {new Intl.DateTimeFormat("en-US", {
                day: "2-digit",
                month: "short",
              }).format(new Date(task.dueDate))}
            </span>
          ) : null}
          <Badge variant={priorityVariant[task.priority]} className="rounded-sm">
            {priorityLabels[task.priority]}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5">
            <ListFilter className="size-3" />
            {task.progress}
          </span>
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
          {getInitials(task.assignee?.name ?? "NA")}
        </span>
      </div>
    </Card>
  );
}

function BoardColumn({
  children,
  className,
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id: TaskStatus;
  style?: React.CSSProperties;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "min-h-160 min-w-72 rounded-md border transition",
        className,
        isOver && "ring-2 ring-emerald-500",
      )}
      style={style}
    >
      {children}
    </section>
  );
}

export function TaskManagementPage() {
  const { toast } = useToast();
  const taskManagementQuery = useTaskManagementQuery();
  const [columns, setColumns] = useState<BoardColumnRecord[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [form, setForm] = useState<TaskForm>(defaultForm());
  const [boardForm, setBoardForm] = useState<BoardForm>(defaultBoardForm());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskPendingDelete, setTaskPendingDelete] = useState<TaskItem | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardPendingDelete, setBoardPendingDelete] =
    useState<BoardColumnRecord | null>(null);
  const createBoardMutation = useCreateTaskBoardMutation();
  const updateBoardMutation = useUpdateTaskBoardMutation();
  const deleteBoardMutation = useDeleteTaskBoardMutation();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const moveTaskMutation = useMoveTaskMutation();
  const accountsQuery = useAccountsQuery();
  const staffUsers = useMemo(
    () =>
      (accountsQuery.data ?? []).filter(
        (user) => user.accountStatus !== "SUSPENDED",
      ),
    [accountsQuery.data],
  );
  const fallbackStaff = useMemo(
    () =>
      [
        { id: "KL", name: "Kyle Andre Lim", position: UserPosition.IT },
        { id: "NB", name: "Noime Binwag Bayong", position: UserPosition.OPERATIONS },
        { id: "MT", name: "Miriam Turtur", position: UserPosition.ACCOUNTING_FINANCE },
        { id: "RM", name: "Rodel Manzo", position: UserPosition.OPERATIONS },
      ] satisfies Pick<UserPublic, "id" | "name" | "position">[],
    [],
  );
  const assigneeOptions = staffUsers.length ? staffUsers : fallbackStaff;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const boards = taskManagementQuery.data?.data.boards ?? [];
    setColumns(boards);
    setTasks(boards.flatMap((board) => board.tasks));
  }, [taskManagementQuery.data?.data.boards]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = normalizedSearch
        ? `${task.title} ${task.code} ${task.assignee?.name ?? ""}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesPriority = priority === "all" || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [priority, search, tasks]);

  const moveTask = (taskId: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, boardId: status } : task)),
    );
    void moveTaskMutation.mutateAsync({ taskId, boardId: status }).catch((error) => {
      toast({
        title: "Move failed",
        description: toApiError(error).message,
        variant: "error",
      });
      void taskManagementQuery.refetch();
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overColumn = columns.find((column) => column.id === overId)?.id;

    setTasks((current) => {
      const activeTask = current.find((task) => task.id === activeId);
      if (!activeTask) return current;
      const overTask = current.find((task) => task.id === overId);
      const nextStatus = overColumn ?? overTask?.boardId;
      if (!nextStatus) return current;
      const updated = current.map((task) =>
        task.id === activeId ? { ...task, boardId: nextStatus } : task,
      );

      void moveTaskMutation.mutateAsync({
        taskId: activeId,
        boardId: nextStatus,
        sortOrder: overTask?.sortOrder,
      }).catch((error) => {
        toast({
          title: "Move failed",
          description: toApiError(error).message,
          variant: "error",
        });
        void taskManagementQuery.refetch();
      });

      if (!overTask || activeId === overId) return updated;
      return arrayMove(
        updated,
        updated.findIndex((task) => task.id === activeId),
        updated.findIndex((task) => task.id === overId),
      );
    });
  };

  const openNewTask = (status: TaskStatus = columns[0]?.id ?? "") => {
    setEditingTaskId(null);
    setForm(defaultForm(status));
    setDialogOpen(true);
  };

  const openEditTask = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setForm({
      assigneeId: task.assigneeId ?? "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority,
      status: task.boardId,
      title: task.title,
    });
    setDialogOpen(true);
  };

  const openNewBoard = () => {
    setEditingBoardId(null);
    setBoardForm(defaultBoardForm());
    setBoardDialogOpen(true);
  };

  const openEditBoard = (column: BoardColumnRecord) => {
    setEditingBoardId(column.id);
    setBoardForm({ color: column.color, title: column.title });
    setBoardDialogOpen(true);
  };

  const saveBoard = async () => {
    const title = boardForm.title.trim();
    if (!title) return;
    try {
      if (editingBoardId) {
        await updateBoardMutation.mutateAsync({
          boardId: editingBoardId,
          payload: { title, color: boardForm.color },
        });
        toast({ title: "Board updated" });
      } else {
        await createBoardMutation.mutateAsync({
          title,
          color: boardForm.color,
        });
        toast({ title: "Board created" });
      }
      setBoardDialogOpen(false);
      setEditingBoardId(null);
      setBoardForm(defaultBoardForm());
    } catch (error) {
      toast({
        title: "Save failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const deleteBoard = async () => {
    if (!boardPendingDelete) return;
    try {
      await deleteBoardMutation.mutateAsync(boardPendingDelete.id);
      toast({ title: "Board deleted", description: boardPendingDelete.title });
      setBoardPendingDelete(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const saveTask = async () => {
    const title = form.title.trim();
    if (!title || !form.status) return;
    try {
      const payload = {
        title,
        boardId: form.status,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined,
      };

      if (editingTaskId) {
        await updateTaskMutation.mutateAsync({
          taskId: editingTaskId,
          payload,
        });
        toast({ title: "Task updated" });
      } else {
        await createTaskMutation.mutateAsync(payload);
        toast({ title: "Task created" });
      }
      setDialogOpen(false);
      setEditingTaskId(null);
      setForm(defaultForm(columns[0]?.id ?? ""));
    } catch (error) {
      toast({
        title: "Save failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const deleteTask = async () => {
    if (!taskPendingDelete) return;
    try {
      await deleteTaskMutation.mutateAsync(taskPendingDelete.id);
      toast({ title: "Task deleted", description: taskPendingDelete.title });
      setTaskPendingDelete(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const updateForm = (field: keyof TaskForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateBoardForm = (field: keyof BoardForm, value: string) => {
    setBoardForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan, assign, and monitor internal work across one Kanban board.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={openNewBoard}>
            <Plus className="size-4" />
            New Board
          </Button>
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            onClick={() => openNewTask()}
          >
            <Plus className="size-4" />
            New Task
          </Button>
        </div>
      </header>

      <Card className="gap-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_auto]">
          <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search tasks, ticket, or assignee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as typeof priority)}
          >
            <SelectTrigger className="h-10 w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Circle className="size-3 fill-emerald-600 text-emerald-600" />
            {filteredTasks.length} visible tasks
          </div>
        </div>
      </Card>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.boardId === column.id,
            );
            return (
              <BoardColumn
                key={column.id}
                id={column.id}
                style={{
                  backgroundColor: `color-mix(in srgb, ${column.color} 8%, white)`,
                  borderColor: `color-mix(in srgb, ${column.color} 25%, white)`,
                }}
              >
                <div
                  className="flex items-center justify-between border-b px-3 py-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${column.color} 18%, white)`,
                    borderColor: `color-mix(in srgb, ${column.color} 30%, white)`,
                  }}
                >
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <h2
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: column.color }}
                  >
                    {column.title}
                  </h2>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open column actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openNewTask(column.id)}>
                      <Plus className="size-4" />
                      Add task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditBoard(column)}>
                      <Pencil className="size-4" />
                      Edit board
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={columns.length <= 1}
                      variant="destructive"
                      onClick={() => setBoardPendingDelete(column)}
                    >
                      <Trash2 className="size-4" />
                      Delete board
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setTasks((current) => {
                          const doneBoardId =
                            columns.find((item) => item.id === "done")?.id ??
                            columns[columns.length - 1]?.id ??
                            column.id;
                          current
                            .filter((task) => task.boardId === column.id)
                            .forEach((task) => {
                              void moveTaskMutation.mutateAsync({
                                taskId: task.id,
                                boardId: doneBoardId,
                              });
                            });
                          return current.map((task) =>
                            task.boardId === column.id
                              ? { ...task, boardId: doneBoardId }
                              : task,
                          );
                        })
                      }
                    >
                      Mark column done
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

                <SortableContext
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 p-3">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        columns={columns}
                        task={task}
                        onDelete={setTaskPendingDelete}
                        onEdit={openEditTask}
                        onMove={moveTask}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => openNewTask(column.id)}
                    >
                      <Plus className="size-4" />
                      Create
                    </Button>
                  </div>
                </SortableContext>
              </BoardColumn>
            );
          })}
        </div>
      </DndContext>

      <Dialog
        open={boardDialogOpen}
        onOpenChange={(open) => {
          setBoardDialogOpen(open);
          if (!open) {
            setEditingBoardId(null);
            setBoardForm(defaultBoardForm());
          }
        }}
      >
        <DialogContent className="max-w-md!">
          <DialogHeader>
            <DialogTitle>
              {editingBoardId ? "Edit Board" : "New Board"}
            </DialogTitle>
            <DialogDescription>
              {editingBoardId
                ? "Update this board name and color."
                : "Create a new board to organize related tasks."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-xs font-medium">Board Name</span>
              <Input
                value={boardForm.title}
                onChange={(event) =>
                  updateBoardForm("title", event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Board Color</span>
              <div className="flex items-center gap-3 rounded-md border bg-background p-2">
                <Input
                  type="color"
                  value={boardForm.color}
                  onChange={(event) =>
                    updateBoardForm("color", event.target.value)
                  }
                  className="h-10 w-14 shrink-0 cursor-pointer p-1"
                />
                <Input
                  value={boardForm.color}
                  onChange={(event) =>
                    updateBoardForm("color", event.target.value)
                  }
                />
              </div>
            </label>
            <div
              className="rounded-md border p-3"
              style={{
                backgroundColor: `color-mix(in srgb, ${boardForm.color} 10%, white)`,
                borderColor: `color-mix(in srgb, ${boardForm.color} 35%, white)`,
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: boardForm.color }}
              >
                {boardForm.title || "Board Preview"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBoardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={!boardForm.title.trim()}
              onClick={saveBoard}
            >
              {editingBoardId ? "Update Board" : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(boardPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setBoardPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {boardPendingDelete?.title} and all tasks inside
              it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                deleteBoard();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(taskPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setTaskPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {taskPendingDelete?.title}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                deleteTask();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTaskId(null);
            setForm(defaultForm(columns[0]?.id ?? ""));
          }
        }}
      >
        <DialogContent className="max-w-lg!">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {editingTaskId
                ? "Update task details, assignee, priority, and board."
                : "Create a task, assign staff, and place it on a board."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-xs font-medium">Task Title</span>
              <Textarea
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-medium">Status</span>
                <Select
                  value={form.status}
                  onValueChange={(value) => updateForm("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium">Priority</span>
                <Select
                  value={form.priority}
                  onValueChange={(value) => updateForm("priority", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium">Assignee</span>
                <Select
                  value={form.assigneeId}
                  onValueChange={(value) => updateForm("assigneeId", value)}
                >
                  <SelectTrigger className="w-full">
                    <UserRound className="size-4 text-muted-foreground" />
                    <SelectValue
                      placeholder={
                        accountsQuery.isLoading ? "Loading staff..." : "Select staff"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assigneeOptions.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                        {user.position ? ` - ${formatPosition(user.position)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium">Due Date</span>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm("dueDate", event.target.value)
                    }
                  />
                </div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={!form.title.trim()}
              onClick={saveTask}
            >
              {editingTaskId ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
