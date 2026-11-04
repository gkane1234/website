import { ZodError } from "zod";
import { commitmentCreateSchema, type CommitmentCreateInput } from "../domain/schemas";
import type { CommitmentListFilters } from "../domain/types";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";

export function createCommitmentService(store: DataStore) {
  return {
    async list(userId: string, filters?: CommitmentListFilters) {
      return store.commitments.list(userId, filters);
    },
    async create(userId: string, input: CommitmentCreateInput) {
      try {
        const data = commitmentCreateSchema.parse(input);
        if (data.source === "google") {
          throw new ServiceError("Google events are read-only and are not stored");
        }
        return await store.commitments.create(userId, { ...data, source: "app" });
      } catch (error) {
        if (error instanceof ServiceError) throw error;
        const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid commitment" : "Invalid commitment";
        throw new ServiceError(message);
      }
    },
    async delete(userId: string, id: string) {
      const removed = await store.commitments.delete(userId, id);
      if (!removed) throw new ServiceError("Commitment not found");
    },
  };
}
