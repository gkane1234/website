import { zonedTimeToISO } from "../dates";
import type { Priority, Task, TaskStatus } from "../domain/types";
import type { DailyPlanPayload } from "../domain/schemas";

export interface BusyInterval {
  title: string;
  start: string;
  end: string;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<TaskStatus, number> = {
  in_progress: 0,
  ready: 1,
  blocked: 2,
  inbox: 3,
  completed: 4,
};

function isCandidate(task: Task, today: string) {
  if (task.status === "completed") return false;
  if (task.status === "inbox") return Boolean(task.dueDate && task.dueDate <= today);
  return true;
}

function compareTasks(today: string) {
  return (a: Task, b: Task) => {
    const aOverdue = a.dueDate && a.dueDate < today ? 0 : 1;
    const bOverdue = b.dueDate && b.dueDate < today ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const aToday = a.dueDate === today ? 0 : 1;
    const bToday = b.dueDate === today ? 0 : 1;
    if (aToday !== bToday) return aToday - bToday;
    const status = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (status !== 0) return status;
    const priority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priority !== 0) return priority;
    const due = (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
    if (due !== 0) return due;
    return a.title.localeCompare(b.title);
  };
}

function freeGaps(windowStart: number, windowEnd: number, busy: { start: number; end: number }[]) {
  const merged: { start: number; end: number }[] = [];
  const clipped = busy
    .map((item) => ({
      start: Math.max(item.start, windowStart),
      end: Math.min(item.end, windowEnd),
    }))
    .filter((item) => item.end > item.start)
    .sort((a, b) => a.start - b.start);

  for (const item of clipped) {
    const last = merged[merged.length - 1];
    if (!last || item.start > last.end) merged.push({ ...item });
    else last.end = Math.max(last.end, item.end);
  }

  const gaps: { start: number; end: number }[] = [];
  let cursor = windowStart;
  for (const item of merged) {
    if (item.start > cursor) gaps.push({ start: cursor, end: item.start });
    cursor = Math.max(cursor, item.end);
  }
  if (cursor < windowEnd) gaps.push({ start: cursor, end: windowEnd });
  return gaps;
}

function formatClock(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function buildDailyPlan(input: {
  date: string;
  tasks: Task[];
  commitments: BusyInterval[];
  timeZone: string;
}): DailyPlanPayload {
  const selected = input.tasks.filter((task) => isCandidate(task, input.date)).sort(compareTasks(input.date)).slice(0, 8);
  const windowStart = new Date(zonedTimeToISO(input.date, 9, 0, input.timeZone)).getTime();
  const windowEnd = new Date(zonedTimeToISO(input.date, 18, 0, input.timeZone)).getTime();
  const gaps = freeGaps(
    windowStart,
    windowEnd,
    input.commitments.map((item) => ({
      start: new Date(item.start).getTime(),
      end: new Date(item.end).getTime(),
    })),
  );

  const blocks: DailyPlanPayload["blocks"] = [];
  const used = new Set<string>();
  const schedulable = selected.filter((task) => task.status === "ready" || task.status === "in_progress");

  for (const gap of gaps) {
    let cursor = gap.start;
    for (const task of schedulable) {
      if (used.has(task.id)) continue;
      const minutes = task.estimatedMinutes ?? 30;
      const end = cursor + minutes * 60 * 1000;
      if (end <= gap.end) {
        blocks.push({
          taskId: task.id,
          start: new Date(cursor).toISOString(),
          end: new Date(end).toISOString(),
        });
        used.add(task.id);
        cursor = end;
      }
    }
  }

  const orderedTaskIds = [
    ...blocks.map((block) => block.taskId),
    ...selected.filter((task) => !used.has(task.id)).map((task) => task.id),
  ];

  const titles = new Map(input.tasks.map((task) => [task.id, task]));
  const overdue = selected.filter((task) => task.dueDate && task.dueDate < input.date).length;
  const dueToday = selected.filter((task) => task.dueDate === input.date).length;
  const commitmentNames = input.commitments.map((item) => item.title);

  if (selected.length === 0) {
    return {
      date: input.date,
      summary: `No open tasks to plan for ${input.date}. Commitments: ${commitmentNames.join(", ") || "none"}.`,
      orderedTaskIds: [],
      blocks: [],
    };
  }

  const scheduledLines = blocks.map((block) => {
    const task = titles.get(block.taskId);
    const minutes = task?.estimatedMinutes ?? 30;
    return `${formatClock(block.start, input.timeZone)} ${task?.title ?? "Task"} (${minutes}m)`;
  });
  const leftOut = selected.length - blocks.length;
  const summary = [
    `${input.date}: ${overdue} overdue, ${dueToday} due today.`,
    scheduledLines.length ? `Scheduled ${scheduledLines.join("; ")}.` : "Nothing fit the free gaps.",
    leftOut > 0 ? `${leftOut} task${leftOut === 1 ? "" : "s"} left outside the work window.` : "Every selected task fits.",
    `Commitments: ${commitmentNames.join(", ") || "none"}.`,
  ].join(" ");

  return {
    date: input.date,
    summary,
    orderedTaskIds,
    blocks,
  };
}

/** Next free gap at least `minutes` long inside 09:00–18:00. */
export function nextFreeSlot(input: {
  date: string;
  minutes: number;
  commitments: BusyInterval[];
  timeZone: string;
  notBefore?: string;
}) {
  const windowStart = new Date(zonedTimeToISO(input.date, 9, 0, input.timeZone)).getTime();
  const windowEnd = new Date(zonedTimeToISO(input.date, 18, 0, input.timeZone)).getTime();
  const earliest = input.notBefore ? new Date(input.notBefore).getTime() : windowStart;
  const gaps = freeGaps(
    windowStart,
    windowEnd,
    input.commitments.map((item) => ({
      start: new Date(item.start).getTime(),
      end: new Date(item.end).getTime(),
    })),
  );
  const duration = input.minutes * 60 * 1000;
  for (const gap of gaps) {
    const start = Math.max(gap.start, earliest);
    if (gap.end - start >= duration) {
      return {
        start: new Date(start).toISOString(),
        end: new Date(start + duration).toISOString(),
      };
    }
  }
  return null;
}
