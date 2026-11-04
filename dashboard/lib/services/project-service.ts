import { ZodError } from "zod";
import { projectCreateSchema, projectPatchSchema, type ProjectCreateInput, type ProjectPatchInput } from "../domain/schemas";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";

function message(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid project";
  if (error instanceof Error) return error.message;
  return "Invalid project";
}

export function createProjectService(store: DataStore) {
  return {
    async list(userId: string) {
      return store.projects.list(userId);
    },
    async get(userId: string, id: string) {
      return store.projects.get(userId, id);
    },
    async create(userId: string, input: ProjectCreateInput) {
      try {
        const data = projectCreateSchema.parse(input);
        return await store.projects.create(userId, data);
      } catch (error) {
        if (error instanceof ServiceError) throw error;
        throw new ServiceError(message(error));
      }
    },
    async update(userId: string, id: string, patch: ProjectPatchInput) {
      let data: ProjectPatchInput;
      try {
        data = projectPatchSchema.parse(patch);
      } catch (error) {
        throw new ServiceError(message(error));
      }
      const updated = await store.projects.update(userId, id, data);
      if (!updated) throw new ServiceError("Project not found");
      return updated;
    },
    async delete(userId: string, id: string) {
      const removed = await store.projects.delete(userId, id);
      if (!removed) throw new ServiceError("Project not found");
    },
  };
}

export type ProjectService = ReturnType<typeof createProjectService>;
