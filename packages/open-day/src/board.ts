export const taskStatuses = ["backlog", "design", "todo", "doing", "review", "done"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  design: "Design",
  todo: "To-Do",
  doing: "Doing",
  review: "Review",
  done: "Done",
};

export type DayTask = {
  id: string;
  title: string;
  status: TaskStatus;
  minutes: number;
};

const QUICK_BLOCK_MINUTES = 30;

export function isTaskStatus(value: string): value is TaskStatus {
  return taskStatuses.some((status) => status === value);
}

export function quickBlock(title = "Quick block"): Omit<DayTask, "id"> {
  return { title, status: "todo", minutes: QUICK_BLOCK_MINUTES };
}

export function moveTask<T extends { id: string; status: TaskStatus }>(
  tasks: readonly T[],
  id: string,
  status: TaskStatus,
): T[] {
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}

export function onTimeline<T extends { status: TaskStatus }>(tasks: readonly T[]): T[] {
  return tasks.filter((task) => task.status === "doing");
}
