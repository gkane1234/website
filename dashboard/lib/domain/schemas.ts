import { z } from "zod";
import {
  AGENT_ACTION_STATUSES,
  COMMITMENT_SOURCES,
  INBOX_STATUSES,
  PRIORITIES,
  PROJECT_STATUSES,
  TASK_STATUSES,
} from "./types";

export const prioritySchema = z.enum(PRIORITIES);
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export const taskStatusSchema = z.enum(TASK_STATUSES);
export const inboxStatusSchema = z.enum(INBOX_STATUSES);
export const commitmentSourceSchema = z.enum(COMMITMENT_SOURCES);
export const agentActionStatusSchema = z.enum(AGENT_ACTION_STATUSES);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");
const timestampSchema = z.string().min(1);

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  status: projectStatusSchema.default("active"),
  priority: prioritySchema.default("medium"),
  description: z.string().trim().max(2000).default(""),
  targetDate: dateSchema.nullable().optional(),
});

export const projectPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    status: projectStatusSchema.optional(),
    priority: prioritySchema.optional(),
    description: z.string().trim().max(2000).optional(),
    targetDate: dateSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No changes" });

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  projectId: z.string().uuid().nullable().optional(),
  status: taskStatusSchema.default("ready"),
  priority: prioritySchema.default("medium"),
  dueDate: dateSchema.nullable().optional(),
  estimatedMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
  scheduledStart: timestampSchema.nullable().optional(),
  scheduledEnd: timestampSchema.nullable().optional(),
});

export const taskPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    projectId: z.string().uuid().nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: prioritySchema.optional(),
    dueDate: dateSchema.nullable().optional(),
    estimatedMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
    scheduledStart: timestampSchema.nullable().optional(),
    scheduledEnd: timestampSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No changes" });

export const taskUpdateProposalSchema = z.object({
  taskId: z.string().uuid(),
  patch: taskPatchSchema,
});

export const inboxCreateSchema = z.object({
  body: z.string().trim().min(1, "Write something to capture").max(4000),
});

export const noteCreateSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  projectId: z.string().uuid().nullable().optional(),
  taskId: z.string().uuid().nullable().optional(),
});

export const commitmentCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    start: timestampSchema,
    end: timestampSchema,
    recurrence: z.string().trim().max(200).nullable().optional(),
    source: commitmentSourceSchema.default("app"),
  })
  .refine((value) => new Date(value.end).getTime() > new Date(value.start).getTime(), {
    message: "End must be after start",
    path: ["end"],
  });

export const dailyPlanBlockSchema = z.object({
  taskId: z.string().uuid(),
  start: timestampSchema,
  end: timestampSchema,
});

export const dailyPlanPayloadSchema = z.object({
  date: dateSchema,
  summary: z.string().trim().min(1),
  orderedTaskIds: z.array(z.string().uuid()),
  blocks: z.array(dailyPlanBlockSchema).optional(),
});

export const taskListFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  overdue: z.boolean().optional(),
  today: dateSchema.optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectPatchInput = z.infer<typeof projectPatchSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;
export type TaskUpdateProposalInput = z.infer<typeof taskUpdateProposalSchema>;
export type InboxCreateInput = z.infer<typeof inboxCreateSchema>;
export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type CommitmentCreateInput = z.infer<typeof commitmentCreateSchema>;
export type DailyPlanPayload = z.infer<typeof dailyPlanPayloadSchema>;
