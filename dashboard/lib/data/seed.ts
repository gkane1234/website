import { LOCAL_USER_ID } from "../auth/constants";
import { addDays, todayISO, zonedTimeToISO } from "../dates";
import type { CommitmentCreateInput, NoteCreateInput, ProjectCreateInput, TaskCreateInput } from "../domain/schemas";

export const SEEDED_TASK_TITLE = "Outline the weekly review";

export const SEED_IDS = {
  projectSystems: "10000000-0000-4000-8000-000000000001",
  projectMath: "10000000-0000-4000-8000-000000000002",
  projectPortfolio: "10000000-0000-4000-8000-000000000003",
  projectHealth: "10000000-0000-4000-8000-000000000004",
  taskWeekly: "20000000-0000-4000-8000-000000000001",
  taskFractions: "20000000-0000-4000-8000-000000000002",
  taskUganda: "20000000-0000-4000-8000-000000000003",
  taskReadme: "20000000-0000-4000-8000-000000000004",
  taskPractice: "20000000-0000-4000-8000-000000000005",
  taskPrint: "20000000-0000-4000-8000-000000000006",
  noteWeekly: "30000000-0000-4000-8000-000000000001",
  noteMath: "30000000-0000-4000-8000-000000000002",
  inboxRecital: "40000000-0000-4000-8000-000000000001",
  inboxPrintout: "40000000-0000-4000-8000-000000000002",
  commitmentDeep: "50000000-0000-4000-8000-000000000001",
  commitmentStudio: "50000000-0000-4000-8000-000000000002",
} as const;

export interface SeedBundle {
  userId: string;
  projects: Array<ProjectCreateInput & { id: string }>;
  tasks: Array<TaskCreateInput & { id: string }>;
  notes: Array<NoteCreateInput & { id: string }>;
  inbox: Array<{ id: string; body: string }>;
  commitments: Array<CommitmentCreateInput & { id: string }>;
}

export function buildSeed(now = new Date(), timeZone?: string): SeedBundle {
  const today = todayISO(now, timeZone);
  const deepStart = zonedTimeToISO(today, 9, 0, timeZone);
  const deepEnd = zonedTimeToISO(today, 11, 0, timeZone);
  const studioStart = zonedTimeToISO(today, 15, 0, timeZone);
  const studioEnd = zonedTimeToISO(today, 16, 30, timeZone);

  return {
    userId: LOCAL_USER_ID,
    projects: [
      {
        id: SEED_IDS.projectSystems,
        name: "Personal systems",
        status: "active",
        priority: "high",
        description: "Keep the week honest: tasks, notes, and one daily plan.",
        targetDate: addDays(today, 14),
      },
      {
        id: SEED_IDS.projectMath,
        name: "Elementary math worksheets",
        status: "active",
        priority: "medium",
        description: "Printable worksheets, answer keys, and the fraction set.",
        targetDate: addDays(today, 21),
      },
      {
        id: SEED_IDS.projectHealth,
        name: "Maternal health analytics",
        status: "active",
        priority: "high",
        description: "Follow-ups from the Well on Their Way data work.",
        targetDate: addDays(today, 10),
      },
      {
        id: SEED_IDS.projectPortfolio,
        name: "Portfolio site",
        status: "paused",
        priority: "low",
        description: "The public site stays separate from this dashboard.",
        targetDate: null,
      },
    ],
    tasks: [
      {
        id: SEED_IDS.taskWeekly,
        title: SEEDED_TASK_TITLE,
        projectId: SEED_IDS.projectSystems,
        status: "ready",
        priority: "high",
        dueDate: today,
        estimatedMinutes: 25,
      },
      {
        id: SEED_IDS.taskFractions,
        title: "Fix the fractions answer key",
        projectId: SEED_IDS.projectMath,
        status: "in_progress",
        priority: "high",
        dueDate: today,
        estimatedMinutes: 45,
      },
      {
        id: SEED_IDS.taskUganda,
        title: "Reply to the Uganda data questions",
        projectId: SEED_IDS.projectHealth,
        status: "ready",
        priority: "high",
        dueDate: addDays(today, -2),
        estimatedMinutes: 30,
      },
      {
        id: SEED_IDS.taskReadme,
        title: "Sketch the Barnes-Hut README",
        projectId: null,
        status: "inbox",
        priority: "low",
        dueDate: null,
        estimatedMinutes: 20,
      },
      {
        id: SEED_IDS.taskPractice,
        title: "Record practice notes",
        projectId: null,
        status: "completed",
        priority: "medium",
        dueDate: addDays(today, -1),
        estimatedMinutes: 15,
      },
      {
        id: SEED_IDS.taskPrint,
        title: "Wait on the print shop quote",
        projectId: SEED_IDS.projectMath,
        status: "blocked",
        priority: "medium",
        dueDate: addDays(today, 3),
        estimatedMinutes: 15,
      },
    ],
    notes: [
      {
        id: SEED_IDS.noteWeekly,
        body: "Keep the weekly review to three outcomes. Do not rebuild the whole system.",
        taskId: SEED_IDS.taskWeekly,
        projectId: SEED_IDS.projectSystems,
      },
      {
        id: SEED_IDS.noteMath,
        body: "Check the grade 6 fraction items before anything calculus-shaped.",
        taskId: null,
        projectId: SEED_IDS.projectMath,
      },
    ],
    inbox: [
      { id: SEED_IDS.inboxRecital, body: "Look up the recital program order" },
      { id: SEED_IDS.inboxPrintout, body: "Idea: a one-page morning printout of today's plan" },
    ],
    commitments: [
      {
        id: SEED_IDS.commitmentDeep,
        title: "Deep work",
        start: deepStart,
        end: deepEnd,
        recurrence: null,
        source: "app",
      },
      {
        id: SEED_IDS.commitmentStudio,
        title: "Studio",
        start: studioStart,
        end: studioEnd,
        recurrence: null,
        source: "app",
      },
    ],
  };
}
