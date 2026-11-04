import type { Priority, ProjectStatus, TaskStatus } from "./domain/types";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  inbox: "Inbox",
  ready: "Ready",
  in_progress: "In progress",
  completed: "Done",
  blocked: "Blocked",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  done: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TOOL_LABEL: Record<string, string> = {
  propose_task: "Create task",
  propose_task_update: "Update task",
  propose_project: "Create project",
  propose_daily_plan: "Daily plan",
};
