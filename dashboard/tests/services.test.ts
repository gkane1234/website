import assert from "node:assert/strict";
import test from "node:test";
import { runFallback } from "../lib/agent/fallback";
import { LOCAL_USER_ID } from "../lib/auth/constants";
import { createMemoryStore } from "../lib/data/memory";
import { createAgentService } from "../lib/services/agent-service";
import { createTaskService } from "../lib/services/task-service";

const USER = LOCAL_USER_ID;

test("services create a task on an in-memory store, with no Supabase client", async () => {
  const store = createMemoryStore();
  const tasks = createTaskService(store);
  const task = await tasks.create(USER, { title: "Write the test", priority: "high", status: "ready" });
  assert.equal(task.title, "Write the test");
  assert.equal(task.priority, "high");
  assert.equal(task.userId, USER);
  const listed = await tasks.list(USER);
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.id, task.id);
  await assert.rejects(() => tasks.create(USER, { title: "   ", priority: "low", status: "ready" }), /Title is required/);
});

test("approving a proposal creates the task", async () => {
  const store = createMemoryStore();
  const agent = createAgentService(store);
  const action = await agent.proposeTask(USER, {
    title: "From the assistant",
    priority: "medium",
    status: "inbox",
  });
  assert.equal(action.status, "proposed");
  assert.equal(action.toolName, "propose_task");
  assert.equal((await store.tasks.list(USER)).length, 0);

  const executed = await agent.approve(USER, action.id);
  assert.equal(executed.status, "executed");
  assert.ok(executed.executedAt);

  const listed = await store.tasks.list(USER);
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.title, "From the assistant");
  assert.equal(listed[0]?.status, "inbox");
});

test("rejecting a proposal does not write a task", async () => {
  const store = createMemoryStore();
  const agent = createAgentService(store);
  const action = await agent.proposeTask(USER, {
    title: "Do not save",
    priority: "low",
    status: "ready",
  });
  const rejected = await agent.reject(USER, action.id);
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.executedAt, null);
  assert.equal((await store.tasks.list(USER)).length, 0);
  await assert.rejects(() => agent.approve(USER, action.id), /not awaiting approval/);
});

test("a daily plan row is stored only after approval", async () => {
  const store = createMemoryStore();
  const tasks = createTaskService(store);
  const created = await tasks.create(USER, {
    title: "Ship the note",
    priority: "high",
    status: "ready",
    dueDate: "2026-11-04",
    estimatedMinutes: 30,
  });
  const agent = createAgentService(store, { timeZone: "America/New_York" });
  const action = await agent.proposeDailyPlan(USER, "2026-11-04");
  assert.equal(action.toolName, "propose_daily_plan");
  assert.equal((await store.dailyPlans.list(USER)).length, 0);

  await agent.approve(USER, action.id);
  const plans = await store.dailyPlans.list(USER);
  assert.equal(plans.length, 1);
  assert.equal(plans[0]?.date, "2026-11-04");
  assert.ok(plans[0]?.orderedTaskIds.includes(created.id));
});

test("local assistant commands propose a task and do not create it", async () => {
  const store = createMemoryStore();
  const agent = createAgentService(store);
  const reply = await runFallback(USER, "create task: Buy milk high priority", agent);
  assert.match(reply, /Proposed a task/);
  assert.match(reply, /OPENAI_API_KEY/);
  assert.equal((await store.tasks.list(USER)).length, 0);
  const [action] = await store.agentActions.list(USER);
  assert.equal(action?.status, "proposed");
  assert.equal(action?.toolName, "propose_task");
  assert.equal((action?.payload as { title: string }).title, "Buy milk");
  assert.equal((action?.payload as { priority: string }).priority, "high");
});
