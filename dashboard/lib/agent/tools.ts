import { tool } from "ai";
import { z } from "zod";
import { todayISO } from "../dates";
import { prioritySchema, projectCreateSchema, taskCreateSchema, taskStatusSchema, taskUpdateProposalSchema } from "../domain/schemas";
import { services } from "../services";

function failure(error: unknown) {
  return { error: error instanceof Error ? error.message : "Tool failed" };
}

/**
 * Tools the model is allowed to call. Mutations only file proposals.
 * There is no create/update/delete tool against the repositories.
 */
export function assistantTools(userId: string) {
  const agent = services().agent;
  return {
    get_tasks: tool({
      description: "List tasks for the signed-in user. Read only.",
      parameters: z.object({
        status: taskStatusSchema.optional(),
        priority: prioritySchema.optional(),
        projectId: z.string().uuid().optional(),
        overdue: z.boolean().optional(),
      }),
      execute: async (filters) => {
        try {
          const tasks = await agent.getTasks(userId, { ...filters, today: todayISO() });
          return tasks.slice(0, 40).map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            projectId: task.projectId,
            dueDate: task.dueDate,
            estimatedMinutes: task.estimatedMinutes,
            scheduledStart: task.scheduledStart,
            scheduledEnd: task.scheduledEnd,
          }));
        } catch (error) {
          return failure(error);
        }
      },
    }),
    get_projects: tool({
      description: "List projects for the signed-in user. Read only.",
      parameters: z.object({}),
      execute: async () => {
        try {
          const projects = await agent.getProjects(userId);
          return projects.map((project) => ({
            id: project.id,
            name: project.name,
            status: project.status,
            priority: project.priority,
            description: project.description,
            targetDate: project.targetDate,
          }));
        } catch (error) {
          return failure(error);
        }
      },
    }),
    get_inbox: tool({
      description: "List captured inbox items. Read only.",
      parameters: z.object({}),
      execute: async () => {
        try {
          const items = await agent.getInbox(userId);
          return items.slice(0, 40).map((item) => ({
            id: item.id,
            body: item.body,
            status: item.status,
            capturedAt: item.capturedAt,
          }));
        } catch (error) {
          return failure(error);
        }
      },
    }),
    propose_task: tool({
      description: "File a proposal to create a task. Does not create the task. The user approves it later.",
      parameters: taskCreateSchema,
      execute: async (input) => {
        try {
          const action = await agent.proposeTask(userId, input);
          return {
            status: "proposed" as const,
            actionId: action.id,
            message: "Proposal filed. The task is not created until the user approves it.",
          };
        } catch (error) {
          return failure(error);
        }
      },
    }),
    propose_task_update: tool({
      description: "File a proposal to update a task. Does not change the task until the user approves it.",
      parameters: taskUpdateProposalSchema,
      execute: async (input) => {
        try {
          const action = await agent.proposeTaskUpdate(userId, input);
          return {
            status: "proposed" as const,
            actionId: action.id,
            message: "Update proposed. Nothing changed until the user approves it.",
          };
        } catch (error) {
          return failure(error);
        }
      },
    }),
    propose_project: tool({
      description: "File a proposal to create a project. Does not create the project until the user approves it.",
      parameters: projectCreateSchema,
      execute: async (input) => {
        try {
          const action = await agent.proposeProject(userId, input);
          return {
            status: "proposed" as const,
            actionId: action.id,
            message: "Project proposed. It is not created until the user approves it.",
          };
        } catch (error) {
          return failure(error);
        }
      },
    }),
    propose_daily_plan: tool({
      description: "File a proposed daily plan from tasks, due dates, and known commitments. Does not save the plan until the user approves it.",
      parameters: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
      execute: async ({ date }) => {
        try {
          const action = await agent.proposeDailyPlan(userId, date);
          const payload = action.payload as { date?: string; summary?: string };
          return {
            status: "proposed" as const,
            actionId: action.id,
            date: payload.date,
            summary: payload.summary,
            message: "Daily plan proposed. It is not saved until the user approves it.",
          };
        } catch (error) {
          return failure(error);
        }
      },
    }),
  };
}
