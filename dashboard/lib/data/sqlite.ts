import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type {
  AgentAction,
  AgentActionStatus,
  Commitment,
  DailyPlan,
  InboxItem,
  Note,
  Project,
  Task,
} from "../domain/types";
import type { DataStore } from "./repository";
import { buildSeed } from "./seed";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  description TEXT NOT NULL DEFAULT '',
  target_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('inbox', 'ready', 'in_progress', 'completed', 'blocked')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TEXT,
  estimated_minutes INTEGER,
  scheduled_start TEXT,
  scheduled_end TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inbox_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'processed', 'discarded'))
);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  recurrence TEXT,
  source TEXT NOT NULL CHECK (source IN ('app', 'google')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_date TEXT NOT NULL,
  summary TEXT NOT NULL,
  ordered_task_ids TEXT NOT NULL,
  generated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'rejected', 'executed')),
  created_at TEXT NOT NULL,
  executed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_actions_user ON agent_actions(user_id, created_at);
`;

type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  status: Project["status"];
  priority: Project["priority"];
  description: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  project_id: string | null;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
  estimated_minutes: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    priority: row.priority,
    description: row.description,
    targetDate: row.target_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    projectId: row.project_id,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    estimatedMinutes: row.estimated_minutes,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function defaultDatabasePath() {
  return path.join(process.cwd(), "data", "local.db");
}

export function createSqliteStore(options?: { path?: string; seed?: boolean }): DataStore {
  const dbPath = options?.path ?? defaultDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);

  const projectById = db.prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?");
  const taskById = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");

  function insertProject(userId: string, input: Parameters<DataStore["projects"]["create"]>[1]) {
    const timestamp = nowIso();
    const id = input.id ?? newId();
    db.prepare(
      `INSERT INTO projects (id, user_id, name, status, priority, description, target_date, created_at, updated_at)
       VALUES (@id, @user_id, @name, @status, @priority, @description, @target_date, @created_at, @updated_at)`,
    ).run({
      id,
      user_id: userId,
      name: input.name,
      status: input.status ?? "active",
      priority: input.priority ?? "medium",
      description: input.description ?? "",
      target_date: input.targetDate ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return mapProject(projectById.get(id, userId) as ProjectRow);
  }

  function insertTask(userId: string, input: Parameters<DataStore["tasks"]["create"]>[1]) {
    const timestamp = nowIso();
    const id = input.id ?? newId();
    db.prepare(
      `INSERT INTO tasks (
        id, user_id, title, project_id, status, priority, due_date, estimated_minutes,
        scheduled_start, scheduled_end, created_at, updated_at
      ) VALUES (
        @id, @user_id, @title, @project_id, @status, @priority, @due_date, @estimated_minutes,
        @scheduled_start, @scheduled_end, @created_at, @updated_at
      )`,
    ).run({
      id,
      user_id: userId,
      title: input.title,
      project_id: input.projectId ?? null,
      status: input.status ?? "ready",
      priority: input.priority ?? "medium",
      due_date: input.dueDate ?? null,
      estimated_minutes: input.estimatedMinutes ?? null,
      scheduled_start: input.scheduledStart ?? null,
      scheduled_end: input.scheduledEnd ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return mapTask(taskById.get(id, userId) as TaskRow);
  }

  if (options?.seed !== false) {
    const count = db.prepare("SELECT COUNT(*) AS c FROM projects").get() as { c: number };
    if (count.c === 0) {
      const bundle = buildSeed();
      const write = db.transaction(() => {
        for (const project of bundle.projects) insertProject(bundle.userId, project);
        for (const task of bundle.tasks) insertTask(bundle.userId, task);
        for (const note of bundle.notes) {
          db.prepare(
            `INSERT INTO notes (id, user_id, body, project_id, task_id, created_at)
             VALUES (@id, @user_id, @body, @project_id, @task_id, @created_at)`,
          ).run({
            id: note.id,
            user_id: bundle.userId,
            body: note.body,
            project_id: note.projectId ?? null,
            task_id: note.taskId ?? null,
            created_at: nowIso(),
          });
        }
        for (const item of bundle.inbox) {
          db.prepare(
            `INSERT INTO inbox_items (id, user_id, body, captured_at, status)
             VALUES (@id, @user_id, @body, @captured_at, 'new')`,
          ).run({
            id: item.id,
            user_id: bundle.userId,
            body: item.body,
            captured_at: nowIso(),
          });
        }
        for (const commitment of bundle.commitments) {
          db.prepare(
            `INSERT INTO commitments (id, user_id, title, starts_at, ends_at, recurrence, source, created_at)
             VALUES (@id, @user_id, @title, @starts_at, @ends_at, @recurrence, @source, @created_at)`,
          ).run({
            id: commitment.id,
            user_id: bundle.userId,
            title: commitment.title,
            starts_at: commitment.start,
            ends_at: commitment.end,
            recurrence: commitment.recurrence ?? null,
            source: commitment.source ?? "app",
            created_at: nowIso(),
          });
        }
      });
      write();
    }
  }

  const store: DataStore = {
    projects: {
      async list(userId) {
        const rows = db
          .prepare(
            `SELECT * FROM projects WHERE user_id = ?
             ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'paused' THEN 1 ELSE 2 END,
                      CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
                      name`,
          )
          .all(userId) as ProjectRow[];
        return rows.map(mapProject);
      },
      async get(userId, id) {
        const row = projectById.get(id, userId) as ProjectRow | undefined;
        return row ? mapProject(row) : null;
      },
      async create(userId, input) {
        return insertProject(userId, input);
      },
      async update(userId, id, patch) {
        const sets: string[] = [];
        const params: Record<string, unknown> = { id, user_id: userId, updated_at: nowIso() };
        if (patch.name !== undefined) {
          sets.push("name = @name");
          params.name = patch.name;
        }
        if (patch.status !== undefined) {
          sets.push("status = @status");
          params.status = patch.status;
        }
        if (patch.priority !== undefined) {
          sets.push("priority = @priority");
          params.priority = patch.priority;
        }
        if (patch.description !== undefined) {
          sets.push("description = @description");
          params.description = patch.description;
        }
        if (patch.targetDate !== undefined) {
          sets.push("target_date = @target_date");
          params.target_date = patch.targetDate;
        }
        if (sets.length === 0) {
          const row = projectById.get(id, userId) as ProjectRow | undefined;
          return row ? mapProject(row) : null;
        }
        sets.push("updated_at = @updated_at");
        const info = db.prepare(`UPDATE projects SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
        if (info.changes === 0) return null;
        return mapProject(projectById.get(id, userId) as ProjectRow);
      },
      async delete(userId, id) {
        const info = db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(id, userId);
        return info.changes > 0;
      },
    },
    tasks: {
      async list(userId, filters) {
        const where = ["user_id = @user_id"];
        const params: Record<string, unknown> = { user_id: userId };
        if (filters?.projectId) {
          where.push("project_id = @project_id");
          params.project_id = filters.projectId;
        }
        if (filters?.status) {
          where.push("status = @status");
          params.status = filters.status;
        }
        if (filters?.priority) {
          where.push("priority = @priority");
          params.priority = filters.priority;
        }
        if (filters?.overdue) {
          where.push("due_date IS NOT NULL AND due_date < @today AND status != 'completed'");
          params.today = filters.today ?? "";
        }
        const rows = db
          .prepare(
            `SELECT * FROM tasks WHERE ${where.join(" AND ")}
             ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date,
                      CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
                      created_at`,
          )
          .all(params) as TaskRow[];
        return rows.map(mapTask);
      },
      async get(userId, id) {
        const row = taskById.get(id, userId) as TaskRow | undefined;
        return row ? mapTask(row) : null;
      },
      async create(userId, input) {
        return insertTask(userId, input);
      },
      async update(userId, id, patch) {
        const sets: string[] = [];
        const params: Record<string, unknown> = { id, user_id: userId, updated_at: nowIso() };
        if (patch.title !== undefined) {
          sets.push("title = @title");
          params.title = patch.title;
        }
        if (patch.projectId !== undefined) {
          sets.push("project_id = @project_id");
          params.project_id = patch.projectId;
        }
        if (patch.status !== undefined) {
          sets.push("status = @status");
          params.status = patch.status;
        }
        if (patch.priority !== undefined) {
          sets.push("priority = @priority");
          params.priority = patch.priority;
        }
        if (patch.dueDate !== undefined) {
          sets.push("due_date = @due_date");
          params.due_date = patch.dueDate;
        }
        if (patch.estimatedMinutes !== undefined) {
          sets.push("estimated_minutes = @estimated_minutes");
          params.estimated_minutes = patch.estimatedMinutes;
        }
        if (patch.scheduledStart !== undefined) {
          sets.push("scheduled_start = @scheduled_start");
          params.scheduled_start = patch.scheduledStart;
        }
        if (patch.scheduledEnd !== undefined) {
          sets.push("scheduled_end = @scheduled_end");
          params.scheduled_end = patch.scheduledEnd;
        }
        if (sets.length === 0) {
          const row = taskById.get(id, userId) as TaskRow | undefined;
          return row ? mapTask(row) : null;
        }
        sets.push("updated_at = @updated_at");
        const info = db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
        if (info.changes === 0) return null;
        return mapTask(taskById.get(id, userId) as TaskRow);
      },
      async delete(userId, id) {
        const info = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, userId);
        return info.changes > 0;
      },
    },
    notes: {
      async list(userId, filters) {
        const where = ["user_id = @user_id"];
        const params: Record<string, unknown> = { user_id: userId };
        if (filters?.projectId) {
          where.push("project_id = @project_id");
          params.project_id = filters.projectId;
        }
        if (filters?.taskId) {
          where.push("task_id = @task_id");
          params.task_id = filters.taskId;
        }
        const rows = db
          .prepare(`SELECT * FROM notes WHERE ${where.join(" AND ")} ORDER BY created_at DESC`)
          .all(params) as Array<{
          id: string;
          user_id: string;
          body: string;
          project_id: string | null;
          task_id: string | null;
          created_at: string;
        }>;
        return rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          body: row.body,
          projectId: row.project_id,
          taskId: row.task_id,
          createdAt: row.created_at,
        }));
      },
      async create(userId, input) {
        const id = input.id ?? newId();
        const createdAt = input.createdAt ?? nowIso();
        db.prepare(
          `INSERT INTO notes (id, user_id, body, project_id, task_id, created_at)
           VALUES (@id, @user_id, @body, @project_id, @task_id, @created_at)`,
        ).run({
          id,
          user_id: userId,
          body: input.body,
          project_id: input.projectId ?? null,
          task_id: input.taskId ?? null,
          created_at: createdAt,
        });
        return {
          id,
          userId,
          body: input.body,
          projectId: input.projectId ?? null,
          taskId: input.taskId ?? null,
          createdAt,
        };
      },
    },
    inbox: {
      async list(userId) {
        const rows = db
          .prepare("SELECT * FROM inbox_items WHERE user_id = ? ORDER BY captured_at DESC")
          .all(userId) as Array<{
          id: string;
          user_id: string;
          body: string;
          captured_at: string;
          status: InboxItem["status"];
        }>;
        return rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          body: row.body,
          capturedAt: row.captured_at,
          status: row.status,
        }));
      },
      async create(userId, input) {
        const id = input.id ?? newId();
        const capturedAt = input.capturedAt ?? nowIso();
        db.prepare(
          `INSERT INTO inbox_items (id, user_id, body, captured_at, status)
           VALUES (@id, @user_id, @body, @captured_at, 'new')`,
        ).run({ id, user_id: userId, body: input.body, captured_at: capturedAt });
        return { id, userId, body: input.body, capturedAt, status: "new" as const };
      },
    },
    commitments: {
      async list(userId, filters) {
        const where = ["user_id = @user_id"];
        const params: Record<string, unknown> = { user_id: userId };
        if (filters?.from) {
          where.push("ends_at > @from");
          params.from = filters.from;
        }
        if (filters?.to) {
          where.push("starts_at < @to");
          params.to = filters.to;
        }
        const rows = db
          .prepare(`SELECT * FROM commitments WHERE ${where.join(" AND ")} ORDER BY starts_at`)
          .all(params) as Array<{
          id: string;
          user_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          recurrence: string | null;
          source: Commitment["source"];
          created_at: string;
        }>;
        return rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          start: row.starts_at,
          end: row.ends_at,
          recurrence: row.recurrence,
          source: row.source,
          createdAt: row.created_at,
        }));
      },
      async create(userId, input) {
        const id = input.id ?? newId();
        const createdAt = input.createdAt ?? nowIso();
        db.prepare(
          `INSERT INTO commitments (id, user_id, title, starts_at, ends_at, recurrence, source, created_at)
           VALUES (@id, @user_id, @title, @starts_at, @ends_at, @recurrence, @source, @created_at)`,
        ).run({
          id,
          user_id: userId,
          title: input.title,
          starts_at: input.start,
          ends_at: input.end,
          recurrence: input.recurrence ?? null,
          source: input.source ?? "app",
          created_at: createdAt,
        });
        return {
          id,
          userId,
          title: input.title,
          start: input.start,
          end: input.end,
          recurrence: input.recurrence ?? null,
          source: input.source ?? "app",
          createdAt,
        };
      },
      async delete(userId, id) {
        const info = db.prepare("DELETE FROM commitments WHERE id = ? AND user_id = ?").run(id, userId);
        return info.changes > 0;
      },
    },
    dailyPlans: {
      async list(userId) {
        const rows = db
          .prepare("SELECT * FROM daily_plans WHERE user_id = ? ORDER BY generated_at DESC")
          .all(userId) as Array<{
          id: string;
          user_id: string;
          plan_date: string;
          summary: string;
          ordered_task_ids: string;
          generated_at: string;
        }>;
        return rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          date: row.plan_date,
          summary: row.summary,
          orderedTaskIds: parseJson<string[]>(row.ordered_task_ids, []),
          generatedAt: row.generated_at,
        }));
      },
      async latest(userId, date) {
        const row = (
          date
            ? db
                .prepare(
                  "SELECT * FROM daily_plans WHERE user_id = ? AND plan_date = ? ORDER BY generated_at DESC LIMIT 1",
                )
                .get(userId, date)
            : db.prepare("SELECT * FROM daily_plans WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1").get(userId)
        ) as
          | {
              id: string;
              user_id: string;
              plan_date: string;
              summary: string;
              ordered_task_ids: string;
              generated_at: string;
            }
          | undefined;
        if (!row) return null;
        return {
          id: row.id,
          userId: row.user_id,
          date: row.plan_date,
          summary: row.summary,
          orderedTaskIds: parseJson<string[]>(row.ordered_task_ids, []),
          generatedAt: row.generated_at,
        };
      },
      async create(userId, input) {
        const id = input.id ?? newId();
        const generatedAt = input.generatedAt ?? nowIso();
        db.prepare(
          `INSERT INTO daily_plans (id, user_id, plan_date, summary, ordered_task_ids, generated_at)
           VALUES (@id, @user_id, @plan_date, @summary, @ordered_task_ids, @generated_at)`,
        ).run({
          id,
          user_id: userId,
          plan_date: input.date,
          summary: input.summary,
          ordered_task_ids: JSON.stringify(input.orderedTaskIds),
          generated_at: generatedAt,
        });
        return {
          id,
          userId,
          date: input.date,
          summary: input.summary,
          orderedTaskIds: [...input.orderedTaskIds],
          generatedAt,
        };
      },
    },
    agentActions: {
      async list(userId, status) {
        const rows = (
          status
            ? db
                .prepare("SELECT * FROM agent_actions WHERE user_id = ? AND status = ? ORDER BY created_at DESC")
                .all(userId, status)
            : db.prepare("SELECT * FROM agent_actions WHERE user_id = ? ORDER BY created_at DESC").all(userId)
        ) as Array<{
          id: string;
          user_id: string;
          tool_name: string;
          payload: string;
          status: AgentActionStatus;
          created_at: string;
          executed_at: string | null;
        }>;
        return rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          toolName: row.tool_name,
          payload: parseJson(row.payload, null),
          status: row.status,
          createdAt: row.created_at,
          executedAt: row.executed_at,
        }));
      },
      async get(userId, id) {
        const row = db.prepare("SELECT * FROM agent_actions WHERE id = ? AND user_id = ?").get(id, userId) as
          | {
              id: string;
              user_id: string;
              tool_name: string;
              payload: string;
              status: AgentActionStatus;
              created_at: string;
              executed_at: string | null;
            }
          | undefined;
        if (!row) return null;
        return {
          id: row.id,
          userId: row.user_id,
          toolName: row.tool_name,
          payload: parseJson(row.payload, null),
          status: row.status,
          createdAt: row.created_at,
          executedAt: row.executed_at,
        };
      },
      async create(userId, input) {
        const id = input.id ?? newId();
        const createdAt = input.createdAt ?? nowIso();
        db.prepare(
          `INSERT INTO agent_actions (id, user_id, tool_name, payload, status, created_at, executed_at)
           VALUES (@id, @user_id, @tool_name, @payload, @status, @created_at, NULL)`,
        ).run({
          id,
          user_id: userId,
          tool_name: input.toolName,
          payload: JSON.stringify(input.payload ?? null),
          status: input.status ?? "proposed",
          created_at: createdAt,
        });
        return {
          id,
          userId,
          toolName: input.toolName,
          payload: parseJson(JSON.stringify(input.payload ?? null), null),
          status: input.status ?? "proposed",
          createdAt,
          executedAt: null,
        };
      },
      async compareAndSet(userId, id, from, to) {
        const info = db
          .prepare(
            `UPDATE agent_actions
             SET status = @to,
                 executed_at = CASE WHEN @to = 'executed' THEN @now ELSE executed_at END
             WHERE id = @id AND user_id = @user_id AND status = @from`,
          )
          .run({ to, now: nowIso(), id, user_id: userId, from });
        if (info.changes === 0) return null;
        const row = db.prepare("SELECT * FROM agent_actions WHERE id = ? AND user_id = ?").get(id, userId) as {
          id: string;
          user_id: string;
          tool_name: string;
          payload: string;
          status: AgentActionStatus;
          created_at: string;
          executed_at: string | null;
        };
        return {
          id: row.id,
          userId: row.user_id,
          toolName: row.tool_name,
          payload: parseJson(row.payload, null),
          status: row.status,
          createdAt: row.created_at,
          executedAt: row.executed_at,
        };
      },
    },
  };

  return store;
}
