import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { LOCAL_USER_ID } from "../lib/auth/constants";
import { SEEDED_TASK_TITLE } from "../lib/data/seed";
import { createSqliteStore } from "../lib/data/sqlite";
import { createTaskService } from "../lib/services/task-service";

test("sqlite repository seeds and stores a task without Supabase", async () => {
  const file = path.join(os.tmpdir(), `productivity-${crypto.randomUUID()}.db`);
  const store = createSqliteStore({ path: file, seed: true });
  const tasks = createTaskService(store);
  const seeded = await tasks.list(LOCAL_USER_ID);
  assert.ok(seeded.some((task) => task.title === SEEDED_TASK_TITLE));

  const created = await tasks.create(LOCAL_USER_ID, {
    title: "Temp sqlite task",
    priority: "low",
    status: "ready",
  });
  const again = await tasks.get(LOCAL_USER_ID, created.id);
  assert.equal(again?.title, "Temp sqlite task");
  assert.equal(again?.userId, LOCAL_USER_ID);

  fs.rmSync(file, { force: true });
  fs.rmSync(`${file}-wal`, { force: true });
  fs.rmSync(`${file}-shm`, { force: true });
});
