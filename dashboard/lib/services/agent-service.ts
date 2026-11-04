import { todayISO } from "../dates";
import {
  dailyPlanPayloadSchema,
  projectCreateSchema,
  taskCreateSchema,
  taskUpdateProposalSchema,
  type DailyPlanPayload,
  type ProjectCreateInput,
  type TaskCreateInput,
  type TaskUpdateProposalInput,
} from "../domain/schemas";
import type { AgentAction, AgentActionStatus, TaskListFilters } from "../domain/types";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";
import { createInboxService } from "./inbox-service";
import { createPlanningService, type PlanningOptions } from "./planning-service";
import { createProjectService } from "./project-service";
import { createTaskService } from "./task-service";

/**
 * Mutation tools only insert agent_actions rows. They do not call repository
 * create/update. approve() is the one service method that applies a proposal.
 */
export function createAgentService(store: DataStore, planningOptions: PlanningOptions = {}) {
  const tasks = createTaskService(store);
  const projects = createProjectService(store);
  const inbox = createInboxService(store);
  const planning = createPlanningService(store, planningOptions);

  async function propose(userId: string, toolName: string, payload: unknown) {
    return store.agentActions.create(userId, {
      toolName,
      payload,
      status: "proposed",
    });
  }

  return {
    tasks,
    projects,
    inbox,
    planning,

    async listActions(userId: string, status?: AgentActionStatus) {
      return store.agentActions.list(userId, status);
    },

    async getTasks(userId: string, filters?: TaskListFilters) {
      return tasks.list(userId, filters);
    },
    async getProjects(userId: string) {
      return projects.list(userId);
    },
    async getInbox(userId: string) {
      return inbox.list(userId);
    },

    async proposeTask(userId: string, input: TaskCreateInput) {
      const payload = taskCreateSchema.parse(input);
      return propose(userId, "propose_task", payload);
    },
    async proposeTaskUpdate(userId: string, input: TaskUpdateProposalInput) {
      const payload = taskUpdateProposalSchema.parse(input);
      const existing = await store.tasks.get(userId, payload.taskId);
      if (!existing) throw new ServiceError("Task not found");
      return propose(userId, "propose_task_update", payload);
    },
    async proposeProject(userId: string, input: ProjectCreateInput) {
      const payload = projectCreateSchema.parse(input);
      return propose(userId, "propose_project", payload);
    },
    async proposeDailyPlan(userId: string, date?: string) {
      const draft = await planning.draft(userId, date);
      const payload = dailyPlanPayloadSchema.parse(draft);
      return propose(userId, "propose_daily_plan", payload);
    },

    /** Cron helper: one open or saved plan proposal per date. */
    async proposeDailyPlanOnce(userId: string, date = todayISO()) {
      const existing = await store.agentActions.list(userId);
      const match = existing.find((action) => {
        if (action.toolName !== "propose_daily_plan") return false;
        if (action.status !== "proposed" && action.status !== "approved" && action.status !== "executed") return false;
        const payload = action.payload as { date?: string } | null;
        return payload?.date === date;
      });
      if (match) return match;
      return this.proposeDailyPlan(userId, date);
    },

    async approve(userId: string, actionId: string) {
      const claimed = await store.agentActions.compareAndSet(userId, actionId, "proposed", "approved");
      if (!claimed) throw new ServiceError("Proposal is not awaiting approval");
      try {
        await applyProposal(claimed, { tasks, projects, planning, userId });
      } catch (error) {
        await store.agentActions.compareAndSet(userId, actionId, "approved", "proposed");
        throw error instanceof ServiceError ? error : new ServiceError(error instanceof Error ? error.message : "Could not apply proposal");
      }
      const executed = await store.agentActions.compareAndSet(userId, actionId, "approved", "executed");
      if (!executed) throw new ServiceError("Proposal could not be marked executed");
      return executed;
    },

    async reject(userId: string, actionId: string) {
      const rejected = await store.agentActions.compareAndSet(userId, actionId, "proposed", "rejected");
      if (!rejected) throw new ServiceError("Proposal is not awaiting approval");
      return rejected;
    },
  };
}

async function applyProposal(
  action: AgentAction,
  deps: {
    userId: string;
    tasks: ReturnType<typeof createTaskService>;
    projects: ReturnType<typeof createProjectService>;
    planning: ReturnType<typeof createPlanningService>;
  },
) {
  switch (action.toolName) {
    case "propose_task":
      await deps.tasks.create(deps.userId, taskCreateSchema.parse(action.payload));
      return;
    case "propose_task_update": {
      const payload = taskUpdateProposalSchema.parse(action.payload);
      await deps.tasks.update(deps.userId, payload.taskId, payload.patch);
      return;
    }
    case "propose_project":
      await deps.projects.create(deps.userId, projectCreateSchema.parse(action.payload));
      return;
    case "propose_daily_plan":
      await deps.planning.save(deps.userId, dailyPlanPayloadSchema.parse(action.payload));
      return;
    default:
      throw new ServiceError(`Unknown proposal tool ${action.toolName}`);
  }
}

export type AgentService = ReturnType<typeof createAgentService>;
