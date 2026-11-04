import type {
  AgentAction,
  AgentActionStatus,
  Commitment,
  DailyPlan,
  InboxItem,
  Note,
  Priority,
  Project,
  ProjectStatus,
  Task,
} from "../domain/types";
import type { DataStore } from "./repository";

function newId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function clonePayload(payload: unknown) {
  return JSON.parse(JSON.stringify(payload ?? null)) as unknown;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const PROJECT_STATUS_RANK: Record<ProjectStatus, number> = { active: 0, paused: 1, done: 2 };

/**
 * In-memory store used by service tests. Same interface as SQLite and Supabase.
 */
export function createMemoryStore(): DataStore {
  const projects: Project[] = [];
  const tasks: Task[] = [];
  const notes: Note[] = [];
  const inbox: InboxItem[] = [];
  const commitments: Commitment[] = [];
  const dailyPlans: DailyPlan[] = [];
  const agentActions: AgentAction[] = [];

  return {
    projects: {
      async list(userId) {
        return projects
          .filter((project) => project.userId === userId)
          .sort((a, b) => {
            const status = PROJECT_STATUS_RANK[a.status] - PROJECT_STATUS_RANK[b.status];
            if (status !== 0) return status;
            const priority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
            if (priority !== 0) return priority;
            return a.name.localeCompare(b.name);
          })
          .map((project) => ({ ...project }));
      },
      async get(userId, id) {
        const project = projects.find((item) => item.userId === userId && item.id === id);
        return project ? { ...project } : null;
      },
      async create(userId, input) {
        const timestamp = nowIso();
        const project: Project = {
          id: input.id ?? newId(),
          userId,
          name: input.name,
          status: input.status ?? "active",
          priority: input.priority ?? "medium",
          description: input.description ?? "",
          targetDate: input.targetDate ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        projects.push(project);
        return { ...project };
      },
      async update(userId, id, patch) {
        const project = projects.find((item) => item.userId === userId && item.id === id);
        if (!project) return null;
        if (patch.name !== undefined) project.name = patch.name;
        if (patch.status !== undefined) project.status = patch.status;
        if (patch.priority !== undefined) project.priority = patch.priority;
        if (patch.description !== undefined) project.description = patch.description;
        if (patch.targetDate !== undefined) project.targetDate = patch.targetDate;
        project.updatedAt = nowIso();
        return { ...project };
      },
      async delete(userId, id) {
        const index = projects.findIndex((item) => item.userId === userId && item.id === id);
        if (index === -1) return false;
        projects.splice(index, 1);
        for (const task of tasks) if (task.projectId === id) task.projectId = null;
        for (const note of notes) if (note.projectId === id) note.projectId = null;
        return true;
      },
    },
    tasks: {
      async list(userId, filters) {
        return tasks
          .filter((task) => task.userId === userId)
          .filter((task) => (filters?.projectId ? task.projectId === filters.projectId : true))
          .filter((task) => (filters?.status ? task.status === filters.status : true))
          .filter((task) => (filters?.priority ? task.priority === filters.priority : true))
          .filter((task) => {
            if (!filters?.overdue) return true;
            const today = filters.today ?? "";
            return Boolean(task.dueDate && today && task.dueDate < today && task.status !== "completed");
          })
          .sort((a, b) => {
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && !b.dueDate) return -1;
            if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            const priority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
            if (priority !== 0) return priority;
            return a.createdAt.localeCompare(b.createdAt);
          })
          .map((task) => ({ ...task }));
      },
      async get(userId, id) {
        const task = tasks.find((item) => item.userId === userId && item.id === id);
        return task ? { ...task } : null;
      },
      async create(userId, input) {
        const timestamp = nowIso();
        const task: Task = {
          id: input.id ?? newId(),
          userId,
          title: input.title,
          projectId: input.projectId ?? null,
          status: input.status ?? "ready",
          priority: input.priority ?? "medium",
          dueDate: input.dueDate ?? null,
          estimatedMinutes: input.estimatedMinutes ?? null,
          scheduledStart: input.scheduledStart ?? null,
          scheduledEnd: input.scheduledEnd ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        tasks.push(task);
        return { ...task };
      },
      async update(userId, id, patch) {
        const task = tasks.find((item) => item.userId === userId && item.id === id);
        if (!task) return null;
        if (patch.title !== undefined) task.title = patch.title;
        if (patch.projectId !== undefined) task.projectId = patch.projectId;
        if (patch.status !== undefined) task.status = patch.status;
        if (patch.priority !== undefined) task.priority = patch.priority;
        if (patch.dueDate !== undefined) task.dueDate = patch.dueDate;
        if (patch.estimatedMinutes !== undefined) task.estimatedMinutes = patch.estimatedMinutes;
        if (patch.scheduledStart !== undefined) task.scheduledStart = patch.scheduledStart;
        if (patch.scheduledEnd !== undefined) task.scheduledEnd = patch.scheduledEnd;
        task.updatedAt = nowIso();
        return { ...task };
      },
      async delete(userId, id) {
        const index = tasks.findIndex((item) => item.userId === userId && item.id === id);
        if (index === -1) return false;
        tasks.splice(index, 1);
        for (const note of notes) if (note.taskId === id) note.taskId = null;
        return true;
      },
    },
    notes: {
      async list(userId, filters) {
        return notes
          .filter((note) => note.userId === userId)
          .filter((note) => (filters?.projectId ? note.projectId === filters.projectId : true))
          .filter((note) => (filters?.taskId ? note.taskId === filters.taskId : true))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((note) => ({ ...note }));
      },
      async create(userId, input) {
        const note: Note = {
          id: input.id ?? newId(),
          userId,
          body: input.body,
          projectId: input.projectId ?? null,
          taskId: input.taskId ?? null,
          createdAt: input.createdAt ?? nowIso(),
        };
        notes.push(note);
        return { ...note };
      },
    },
    inbox: {
      async list(userId) {
        return inbox
          .filter((item) => item.userId === userId)
          .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
          .map((item) => ({ ...item }));
      },
      async create(userId, input) {
        const item: InboxItem = {
          id: input.id ?? newId(),
          userId,
          body: input.body,
          capturedAt: input.capturedAt ?? nowIso(),
          status: "new",
        };
        inbox.push(item);
        return { ...item };
      },
    },
    commitments: {
      async list(userId, filters) {
        return commitments
          .filter((item) => item.userId === userId)
          .filter((item) => (filters?.from ? item.end > filters.from : true))
          .filter((item) => (filters?.to ? item.start < filters.to : true))
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((item) => ({ ...item }));
      },
      async create(userId, input) {
        const item: Commitment = {
          id: input.id ?? newId(),
          userId,
          title: input.title,
          start: input.start,
          end: input.end,
          recurrence: input.recurrence ?? null,
          source: input.source ?? "app",
          createdAt: input.createdAt ?? nowIso(),
        };
        commitments.push(item);
        return { ...item };
      },
      async delete(userId, id) {
        const index = commitments.findIndex((item) => item.userId === userId && item.id === id);
        if (index === -1) return false;
        commitments.splice(index, 1);
        return true;
      },
    },
    dailyPlans: {
      async list(userId) {
        return dailyPlans
          .filter((plan) => plan.userId === userId)
          .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
          .map((plan) => ({ ...plan, orderedTaskIds: [...plan.orderedTaskIds] }));
      },
      async latest(userId, date) {
        const match = dailyPlans
          .filter((plan) => plan.userId === userId && (date ? plan.date === date : true))
          .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
        return match ? { ...match, orderedTaskIds: [...match.orderedTaskIds] } : null;
      },
      async create(userId, input) {
        const plan: DailyPlan = {
          id: input.id ?? newId(),
          userId,
          date: input.date,
          summary: input.summary,
          orderedTaskIds: [...input.orderedTaskIds],
          generatedAt: input.generatedAt ?? nowIso(),
        };
        dailyPlans.push(plan);
        return { ...plan, orderedTaskIds: [...plan.orderedTaskIds] };
      },
    },
    agentActions: {
      async list(userId, status) {
        return agentActions
          .filter((action) => action.userId === userId && (status ? action.status === status : true))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((action) => ({ ...action, payload: clonePayload(action.payload) }));
      },
      async get(userId, id) {
        const action = agentActions.find((item) => item.userId === userId && item.id === id);
        return action ? { ...action, payload: clonePayload(action.payload) } : null;
      },
      async create(userId, input) {
        const action: AgentAction = {
          id: input.id ?? newId(),
          userId,
          toolName: input.toolName,
          payload: clonePayload(input.payload),
          status: input.status ?? "proposed",
          createdAt: input.createdAt ?? nowIso(),
          executedAt: null,
        };
        agentActions.push(action);
        return { ...action, payload: clonePayload(action.payload) };
      },
      async compareAndSet(userId, id, from, to) {
        const action = agentActions.find((item) => item.userId === userId && item.id === id);
        if (!action || action.status !== from) return null;
        action.status = to;
        if (to === "executed") action.executedAt = nowIso();
        return { ...action, payload: clonePayload(action.payload) };
      },
    },
  };
}

export type { AgentActionStatus };
