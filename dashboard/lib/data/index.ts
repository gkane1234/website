import type { DataStore } from "./repository";
import { createSqliteStore } from "./sqlite";
import { createSupabaseStore } from "./supabase";

const globalStore = globalThis as unknown as { __productivityStore?: DataStore };

/**
 * Selects the storage provider. SQLite is the default and needs no credentials.
 * Supabase is used only when DATA_PROVIDER=supabase.
 */
export function getStore(): DataStore {
  if (globalStore.__productivityStore) return globalStore.__productivityStore;
  const provider = process.env.DATA_PROVIDER || "sqlite";
  if (provider === "supabase") {
    globalStore.__productivityStore = createSupabaseStore();
  } else if (provider === "sqlite") {
    globalStore.__productivityStore = createSqliteStore();
  } else {
    throw new Error(`Unknown DATA_PROVIDER "${provider}". Use "sqlite" or "supabase".`);
  }
  return globalStore.__productivityStore;
}

export type { DataStore } from "./repository";
