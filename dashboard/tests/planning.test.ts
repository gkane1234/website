import assert from "node:assert/strict";
import test from "node:test";
import { zonedTimeToISO } from "../lib/dates";
import type { Task } from "../lib/domain/types";
import { buildDailyPlan } from "../lib/planning/draft";

test("wall-clock times respect eastern daylight and standard time", () => {
  assert.equal(zonedTimeToISO("2026-11-04", 9, 0, "America/New_York"), "2026-11-04T14:00:00.000Z");
  assert.equal(zonedTimeToISO("2026-07-04", 9, 0, "America/New_York"), "2026-07-04T13:00:00.000Z");
});

test("daily plan places a task after a morning commitment", () => {
  const task: Task = {
    id: "20000000-0000-4000-8000-000000000099",
    userId: "00000000-0000-4000-8000-000000000001",
    title: "Write",
    projectId: null,
    status: "ready",
    priority: "high",
    dueDate: "2026-11-04",
    estimatedMinutes: 30,
    scheduledStart: null,
    scheduledEnd: null,
    createdAt: "2026-11-04T00:00:00.000Z",
    updatedAt: "2026-11-04T00:00:00.000Z",
  };
  const plan = buildDailyPlan({
    date: "2026-11-04",
    tasks: [task],
    commitments: [
      {
        title: "Deep work",
        start: "2026-11-04T14:00:00.000Z",
        end: "2026-11-04T16:00:00.000Z",
      },
    ],
    timeZone: "America/New_York",
  });
  assert.equal(plan.blocks?.[0]?.taskId, task.id);
  assert.equal(plan.blocks?.[0]?.start, "2026-11-04T16:00:00.000Z");
  assert.equal(plan.orderedTaskIds[0], task.id);
  assert.match(plan.summary, /Deep work/);
});
