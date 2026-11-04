import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

/**
 * Supabase provider. Selected only when DATA_PROVIDER=supabase.
 * Every query filters by user id. RLS in supabase/schema.sql also requires
 * user_id = auth.uid() for the authenticated role.
 */

function requiredEnv() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || (!serviceKey && !anonKey)) {
    throw new Error(
      "DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return { url, key: serviceKey || anonKey! };
}

export function createSupabaseClient() {
  const { url, key } = requiredEnv();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

function unwrap<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    status: row.status as Project["status"],
    priority: row.priority as Project["priority"],
    description: String(row.description ?? ""),
    targetDate: (row.target_date as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    projectId: (row.project_id as string | null) ?? null,
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    dueDate: (row.due_date as string | null) ?? null,
    estimatedMinutes: (row.estimated_minutes as number | null) ?? null,
    scheduledStart: (row.scheduled_start as string | null) ?? null,
    scheduledEnd: (row.scheduled_end as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapNote(row: Record<string, unknown>): Note {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    body: String(row.body),
    projectId: (row.project_id as string | null) ?? null,
    taskId: (row.task_id as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

function mapInbox(row: Record<string, unknown>): InboxItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    body: String(row.body),
    capturedAt: String(row.captured_at),
    status: row.status as InboxItem["status"],
  };
}

function mapCommitment(row: Record<string, unknown>): Commitment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    start: String(row.starts_at),
    end: String(row.ends_at),
    recurrence: (row.recurrence as string | null) ?? null,
    source: row.source as Commitment["source"],
    createdAt: String(row.created_at),
  };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapPlan(row: Record<string, unknown>): DailyPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    date: String(row.plan_date),
    summary: String(row.summary),
    orderedTaskIds: asStringArray(row.ordered_task_ids),
    generatedAt: String(row.generated_at),
  };
}

function mapAction(row: Record<string, unknown>): AgentAction {
  let payload: unknown = row.payload ?? null;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      payload = null;
    }
  }
  return {
    id: String(row.id),
    userId: String(row.user_id),
    toolName: String(row.tool_name),
    payload,
    status: row.status as AgentActionStatus,
    createdAt: String(row.created_at),
    executedAt: (row.executed_at as string | null) ?? null,
  };
}

export function createSupabaseStore(client: SupabaseClient = createSupabaseClient()): DataStore {
  return {
    projects: {
      async list(userId) {
        const data = unwrap(
          await client
            .from("projects")
            .select("*")
            .eq("user_id", userId)
            .order("name", { ascending: true }),
        );
        return (data as Record<string, unknown>[]).map(mapProject);
      },
      async get(userId, id) {
        const { data, error } = await client.from("projects").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapProject(data as Record<string, unknown>) : null;
      },
      async create(userId, input) {
        const timestamp = nowIso();
        const row = unwrap(
          await client
            .from("projects")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              name: input.name,
              status: input.status ?? "active",
              priority: input.priority ?? "medium",
              description: input.description ?? "",
              target_date: input.targetDate ?? null,
              created_at: timestamp,
              updated_at: timestamp,
            })
            .select("*")
            .single(),
        );
        return mapProject(row as Record<string, unknown>);
      },
      async update(userId, id, patch) {
        const changes: Record<string, unknown> = { updated_at: nowIso() };
        if (patch.name !== undefined) changes.name = patch.name;
        if (patch.status !== undefined) changes.status = patch.status;
        if (patch.priority !== undefined) changes.priority = patch.priority;
        if (patch.description !== undefined) changes.description = patch.description;
        if (patch.targetDate !== undefined) changes.target_date = patch.targetDate;
        const { data, error } = await client
          .from("projects")
          .update(changes)
          .eq("user_id", userId)
          .eq("id", id)
          .select("*")
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapProject(data as Record<string, unknown>) : null;
      },
      async delete(userId, id) {
        const { data, error } = await client.from("projects").delete().eq("user_id", userId).eq("id", id).select("id");
        if (error) throw new Error(error.message);
        return (data?.length ?? 0) > 0;
      },
    },
    tasks: {
      async list(userId, filters) {
        let query = client.from("tasks").select("*").eq("user_id", userId);
        if (filters?.projectId) query = query.eq("project_id", filters.projectId);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.priority) query = query.eq("priority", filters.priority);
        if (filters?.overdue && filters.today) {
          query = query.lt("due_date", filters.today).neq("status", "completed");
        }
        const data = unwrap(await query.order("due_date", { ascending: true, nullsFirst: false }));
        return (data as Record<string, unknown>[]).map(mapTask);
      },
      async get(userId, id) {
        const { data, error } = await client.from("tasks").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapTask(data as Record<string, unknown>) : null;
      },
      async create(userId, input) {
        const timestamp = nowIso();
        const row = unwrap(
          await client
            .from("tasks")
            .insert({
              id: input.id ?? newId(),
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
            })
            .select("*")
            .single(),
        );
        return mapTask(row as Record<string, unknown>);
      },
      async update(userId, id, patch) {
        const changes: Record<string, unknown> = { updated_at: nowIso() };
        if (patch.title !== undefined) changes.title = patch.title;
        if (patch.projectId !== undefined) changes.project_id = patch.projectId;
        if (patch.status !== undefined) changes.status = patch.status;
        if (patch.priority !== undefined) changes.priority = patch.priority;
        if (patch.dueDate !== undefined) changes.due_date = patch.dueDate;
        if (patch.estimatedMinutes !== undefined) changes.estimated_minutes = patch.estimatedMinutes;
        if (patch.scheduledStart !== undefined) changes.scheduled_start = patch.scheduledStart;
        if (patch.scheduledEnd !== undefined) changes.scheduled_end = patch.scheduledEnd;
        const { data, error } = await client
          .from("tasks")
          .update(changes)
          .eq("user_id", userId)
          .eq("id", id)
          .select("*")
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapTask(data as Record<string, unknown>) : null;
      },
      async delete(userId, id) {
        const { data, error } = await client.from("tasks").delete().eq("user_id", userId).eq("id", id).select("id");
        if (error) throw new Error(error.message);
        return (data?.length ?? 0) > 0;
      },
    },
    notes: {
      async list(userId, filters) {
        let query = client.from("notes").select("*").eq("user_id", userId);
        if (filters?.projectId) query = query.eq("project_id", filters.projectId);
        if (filters?.taskId) query = query.eq("task_id", filters.taskId);
        const data = unwrap(await query.order("created_at", { ascending: false }));
        return (data as Record<string, unknown>[]).map(mapNote);
      },
      async create(userId, input) {
        const row = unwrap(
          await client
            .from("notes")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              body: input.body,
              project_id: input.projectId ?? null,
              task_id: input.taskId ?? null,
              created_at: input.createdAt ?? nowIso(),
            })
            .select("*")
            .single(),
        );
        return mapNote(row as Record<string, unknown>);
      },
    },
    inbox: {
      async list(userId) {
        const data = unwrap(
          await client.from("inbox_items").select("*").eq("user_id", userId).order("captured_at", { ascending: false }),
        );
        return (data as Record<string, unknown>[]).map(mapInbox);
      },
      async create(userId, input) {
        const row = unwrap(
          await client
            .from("inbox_items")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              body: input.body,
              captured_at: input.capturedAt ?? nowIso(),
              status: "new",
            })
            .select("*")
            .single(),
        );
        return mapInbox(row as Record<string, unknown>);
      },
    },
    commitments: {
      async list(userId, filters) {
        let query = client.from("commitments").select("*").eq("user_id", userId);
        if (filters?.from) query = query.gt("ends_at", filters.from);
        if (filters?.to) query = query.lt("starts_at", filters.to);
        const data = unwrap(await query.order("starts_at", { ascending: true }));
        return (data as Record<string, unknown>[]).map(mapCommitment);
      },
      async create(userId, input) {
        const row = unwrap(
          await client
            .from("commitments")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              title: input.title,
              starts_at: input.start,
              ends_at: input.end,
              recurrence: input.recurrence ?? null,
              source: input.source ?? "app",
              created_at: input.createdAt ?? nowIso(),
            })
            .select("*")
            .single(),
        );
        return mapCommitment(row as Record<string, unknown>);
      },
      async delete(userId, id) {
        const { data, error } = await client.from("commitments").delete().eq("user_id", userId).eq("id", id).select("id");
        if (error) throw new Error(error.message);
        return (data?.length ?? 0) > 0;
      },
    },
    dailyPlans: {
      async list(userId) {
        const data = unwrap(
          await client.from("daily_plans").select("*").eq("user_id", userId).order("generated_at", { ascending: false }),
        );
        return (data as Record<string, unknown>[]).map(mapPlan);
      },
      async latest(userId, date) {
        let query = client.from("daily_plans").select("*").eq("user_id", userId);
        if (date) query = query.eq("plan_date", date);
        const { data, error } = await query.order("generated_at", { ascending: false }).limit(1).maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapPlan(data as Record<string, unknown>) : null;
      },
      async create(userId, input) {
        const row = unwrap(
          await client
            .from("daily_plans")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              plan_date: input.date,
              summary: input.summary,
              ordered_task_ids: input.orderedTaskIds,
              generated_at: input.generatedAt ?? nowIso(),
            })
            .select("*")
            .single(),
        );
        return mapPlan(row as Record<string, unknown>);
      },
    },
    agentActions: {
      async list(userId, status) {
        let query = client.from("agent_actions").select("*").eq("user_id", userId);
        if (status) query = query.eq("status", status);
        const data = unwrap(await query.order("created_at", { ascending: false }));
        return (data as Record<string, unknown>[]).map(mapAction);
      },
      async get(userId, id) {
        const { data, error } = await client.from("agent_actions").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapAction(data as Record<string, unknown>) : null;
      },
      async create(userId, input) {
        const row = unwrap(
          await client
            .from("agent_actions")
            .insert({
              id: input.id ?? newId(),
              user_id: userId,
              tool_name: input.toolName,
              payload: input.payload ?? null,
              status: input.status ?? "proposed",
              created_at: input.createdAt ?? nowIso(),
              executed_at: null,
            })
            .select("*")
            .single(),
        );
        return mapAction(row as Record<string, unknown>);
      },
      async compareAndSet(userId, id, from, to) {
        const changes: Record<string, unknown> = { status: to };
        if (to === "executed") changes.executed_at = nowIso();
        const { data, error } = await client
          .from("agent_actions")
          .update(changes)
          .eq("user_id", userId)
          .eq("id", id)
          .eq("status", from)
          .select("*")
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapAction(data as Record<string, unknown>) : null;
      },
    },
  };
}
