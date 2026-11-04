export const PRIORITIES = ["low", "medium", "high"] as const;
export const PROJECT_STATUSES = ["active", "paused", "done"] as const;
export const TASK_STATUSES = ["inbox", "ready", "in_progress", "completed", "blocked"] as const;
export const INBOX_STATUSES = ["new", "processed", "discarded"] as const;
export const COMMITMENT_SOURCES = ["app", "google"] as const;
export const AGENT_ACTION_STATUSES = ["proposed", "approved", "rejected", "executed"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type InboxStatus = (typeof INBOX_STATUSES)[number];
export type CommitmentSource = (typeof COMMITMENT_SOURCES)[number];
export type AgentActionStatus = (typeof AGENT_ACTION_STATUSES)[number];

export interface Project {
  id: string;
  userId: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  description: string;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  projectId: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  estimatedMinutes: number | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Commitment {
  id: string;
  userId: string;
  title: string;
  start: string;
  end: string;
  recurrence: string | null;
  source: CommitmentSource;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  body: string;
  projectId: string | null;
  taskId: string | null;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  userId: string;
  body: string;
  capturedAt: string;
  status: InboxStatus;
}

export interface DailyPlanBlock {
  taskId: string;
  start: string;
  end: string;
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  summary: string;
  orderedTaskIds: string[];
  generatedAt: string;
}

export interface AgentAction {
  id: string;
  userId: string;
  toolName: string;
  payload: unknown;
  status: AgentActionStatus;
  createdAt: string;
  executedAt: string | null;
}

export interface TaskListFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  overdue?: boolean;
  /** Calendar date (YYYY-MM-DD) used to evaluate overdue. */
  today?: string;
}

export interface CommitmentListFilters {
  from?: string;
  to?: string;
}
