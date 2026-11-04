import { ZodError } from "zod";
import { noteCreateSchema, type NoteCreateInput } from "../domain/schemas";
import { ServiceError } from "../errors";
import type { DataStore } from "../data/repository";

export function createNoteService(store: DataStore) {
  return {
    async list(userId: string, filters?: { projectId?: string; taskId?: string }) {
      return store.notes.list(userId, filters);
    },
    async create(userId: string, input: NoteCreateInput) {
      try {
        const data = noteCreateSchema.parse(input);
        return await store.notes.create(userId, data);
      } catch (error) {
        const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid note" : "Invalid note";
        throw new ServiceError(message);
      }
    },
  };
}
