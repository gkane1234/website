import { ZodError } from "zod";
import { inboxCreateSchema, type InboxCreateInput } from "../domain/schemas";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";

export function createInboxService(store: DataStore) {
  return {
    async list(userId: string) {
      return store.inbox.list(userId);
    },
    async capture(userId: string, input: InboxCreateInput) {
      try {
        const data = inboxCreateSchema.parse(input);
        return await store.inbox.create(userId, data);
      } catch (error) {
        const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid inbox item" : "Invalid inbox item";
        throw new ServiceError(message);
      }
    },
  };
}
