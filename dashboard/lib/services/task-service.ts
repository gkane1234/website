import { ZodError } from "zod";
import { taskCreateSchema, taskListFilterSchema, taskPatchSchema, type TaskCreateInput, type TaskPatchInput } from "../domain/schemas";
import type { TaskListFilters } from "../domain/types";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";

function message(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid task";
  if (error instanceof Error) return error.message;
  return "Invalid task";
}

export function createTaskService(store: DataStore) {
  return {
    async list(userId: string, filters?: TaskListFilters) {
      const parsed = filters ? taskListFilterSchema.parse(filters) : {};
      return store.tasks.list(userId, parsed);
    },
    async get(userId: string, id: string) {
      return store.tasks.get(userId, id);
    },
    async create(userId: string, input: TaskCreateInput) {
      let data: TaskCreateInput;
      try {
        data = taskCreateSchema.parse(input);
      } catch (error) {
        throw new ServiceError(message(error));
      }
      if (data.projectId) {
        const project = await store.projects.get(userId, data.projectId);
        if (!project) throw new ServiceError("Project not found");
      }
      return store.tasks.create(userId, data);
    },
    async update(userId: string, id: string, patch: TaskPatchInput) {
      let data: TaskPatchInput;
      try {
        data = taskPatchSchema.parse(patch);
      } catch (error) {
        throw new ServiceError(message(error));
      }
      if (data.projectId) {
        const project = await store.projects.get(userId, data.projectId);
        if (!project) throw new ServiceError("Project not found");
      }
      const updated = await store.tasks.update(userId, id, data);
      if (!updated) throw new ServiceError("Task not found");
      return updated;
    },
    async complete(userId: string, id: string) {
      return this.update(userId, id, { status: "completed" });
    },
    async delete(userId: string, id: string) {
      const removed = await store.tasks.delete(userId, id);
      if (!removed) throw new ServiceError("Task not found");
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;
