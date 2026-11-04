"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "./auth/current-user";
import { appTimeZone, localInputToISO, todayISO, zonedTimeToISO } from "./dates";
import type { Priority, ProjectStatus, TaskStatus } from "./domain/types";
import { errorText, ServiceError } from "./errors";
import { nextFreeSlot } from "./planning/draft";
import { readGoogleDay, services } from "./services";
import { blankToNull, optionalInt, safeReturnTo } from "./search";

function fail(path: string, error: unknown): never {
  const joiner = path.includes("?") ? "&" : "?";
  redirect(`${path}${joiner}error=${encodeURIComponent(errorText(error))}`);
}

function finish(path: string, notice: string) {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/inbox");
  revalidatePath("/schedule");
  revalidatePath("/assistant");
  const joiner = path.includes("?") ? "&" : "?";
  redirect(`${path}${joiner}notice=${encodeURIComponent(notice)}`);
}

export async function createTaskAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/tasks");
  try {
    await services().tasks.create(userId, {
      title: String(formData.get("title") ?? ""),
      projectId: blankToNull(formData.get("projectId")),
      status: String(formData.get("status") ?? "ready") as TaskStatus,
      priority: String(formData.get("priority") ?? "medium") as Priority,
      dueDate: blankToNull(formData.get("dueDate")),
      estimatedMinutes: optionalInt(formData.get("estimatedMinutes")),
    });
  } catch (error) {
    fail(returnTo, error);
  }
  finish(returnTo, "Task created");
}

export async function updateTaskAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/tasks");
  const id = String(formData.get("id") ?? "");
  try {
    await services().tasks.update(userId, id, {
      title: String(formData.get("title") ?? ""),
      projectId: blankToNull(formData.get("projectId")),
      status: String(formData.get("status") ?? "ready") as TaskStatus,
      priority: String(formData.get("priority") ?? "medium") as Priority,
      dueDate: blankToNull(formData.get("dueDate")),
      estimatedMinutes: optionalInt(formData.get("estimatedMinutes")),
      scheduledStart: localInputToISO(blankToNull(formData.get("scheduledStart"))),
      scheduledEnd: localInputToISO(blankToNull(formData.get("scheduledEnd"))),
    });
  } catch (error) {
    fail(returnTo, error);
  }
  finish("/tasks", "Task updated");
}

export async function completeTaskAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/tasks");
  try {
    await services().tasks.complete(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail(returnTo, error);
  }
  finish(returnTo, "Task completed");
}

export async function deleteTaskAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/tasks");
  try {
    await services().tasks.delete(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail(returnTo, error);
  }
  finish("/tasks", "Task deleted");
}

export async function createProjectAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().projects.create(userId, {
      name: String(formData.get("name") ?? ""),
      status: String(formData.get("status") ?? "active") as ProjectStatus,
      priority: String(formData.get("priority") ?? "medium") as Priority,
      description: String(formData.get("description") ?? ""),
      targetDate: blankToNull(formData.get("targetDate")),
    });
  } catch (error) {
    fail("/projects", error);
  }
  finish("/projects", "Project created");
}

export async function updateProjectAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().projects.update(userId, String(formData.get("id") ?? ""), {
      name: String(formData.get("name") ?? ""),
      status: String(formData.get("status") ?? "active") as ProjectStatus,
      priority: String(formData.get("priority") ?? "medium") as Priority,
      description: String(formData.get("description") ?? ""),
      targetDate: blankToNull(formData.get("targetDate")),
    });
  } catch (error) {
    fail("/projects", error);
  }
  finish("/projects", "Project updated");
}

export async function deleteProjectAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().projects.delete(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail("/projects", error);
  }
  finish("/projects", "Project deleted");
}

export async function captureInboxAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().inbox.capture(userId, { body: String(formData.get("body") ?? "") });
  } catch (error) {
    fail("/inbox", error);
  }
  finish("/inbox", "Captured");
}

export async function createNoteAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/tasks");
  try {
    await services().notes.create(userId, {
      body: String(formData.get("body") ?? ""),
      taskId: blankToNull(formData.get("taskId")),
      projectId: blankToNull(formData.get("projectId")),
    });
  } catch (error) {
    fail(returnTo, error);
  }
  finish(returnTo, "Note added");
}

export async function createCommitmentAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/schedule");
  try {
    const start = localInputToISO(blankToNull(formData.get("start")));
    const end = localInputToISO(blankToNull(formData.get("end")));
    if (!start || !end) throw new ServiceError("Start and end are required");
    await services().commitments.create(userId, {
      title: String(formData.get("title") ?? ""),
      start,
      end,
      recurrence: blankToNull(formData.get("recurrence")),
      source: "app",
    });
  } catch (error) {
    fail(returnTo, error);
  }
  finish(returnTo, "Commitment added");
}

export async function deleteCommitmentAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/schedule");
  try {
    await services().commitments.delete(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail(returnTo, error);
  }
  finish(returnTo, "Commitment removed");
}

export async function proposeDailyPlanAction(formData: FormData) {
  const userId = await requireUserId();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/assistant");
  try {
    await services().agent.proposeDailyPlan(userId);
  } catch (error) {
    fail(returnTo, error);
  }
  finish("/assistant", "Daily plan proposed. Approve it to save.");
}

export async function suggestFocusBlockAction() {
  const userId = await requireUserId();
  const today = todayISO();
  try {
    const tasks = await services().tasks.list(userId);
    const rank = { high: 0, medium: 1, low: 2 };
    const candidate = tasks
      .filter((task) => (task.status === "ready" || task.status === "in_progress") && !task.scheduledStart)
      .sort((a, b) => {
        const aDue = a.dueDate && a.dueDate <= today ? 0 : 1;
        const bDue = b.dueDate && b.dueDate <= today ? 0 : 1;
        if (aDue !== bDue) return aDue - bDue;
        return rank[a.priority] - rank[b.priority];
      })[0];
    if (!candidate) throw new ServiceError("No open task to schedule");
    const dayStart = zonedTimeToISO(today, 0, 0);
    const dayEnd = zonedTimeToISO(today, 23, 59);
    const [commitments, google] = await Promise.all([
      services().commitments.list(userId, { from: dayStart, to: dayEnd }),
      readGoogleDay(today),
    ]);
    const slot = nextFreeSlot({
      date: today,
      minutes: candidate.estimatedMinutes ?? 30,
      timeZone: appTimeZone(),
      notBefore: new Date().toISOString(),
      commitments: [
        ...commitments.map((item) => ({ title: item.title, start: item.start, end: item.end })),
        ...google.events.map((item) => ({ title: item.title, start: item.start, end: item.end })),
      ],
    });
    if (!slot) throw new ServiceError("No free gap long enough today");
    await services().agent.proposeTaskUpdate(userId, {
      taskId: candidate.id,
      patch: { scheduledStart: slot.start, scheduledEnd: slot.end },
    });
  } catch (error) {
    fail("/schedule", error);
  }
  finish("/assistant", "Focus block proposed. It is not written to Google Calendar.");
}

export async function approveAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().agent.approve(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail("/assistant", error);
  }
  finish("/assistant", "Proposal approved");
}

export async function rejectAction(formData: FormData) {
  const userId = await requireUserId();
  try {
    await services().agent.reject(userId, String(formData.get("id") ?? ""));
  } catch (error) {
    fail("/assistant", error);
  }
  finish("/assistant", "Proposal rejected");
}
