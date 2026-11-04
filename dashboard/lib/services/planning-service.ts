import { appTimeZone, todayISO, zonedTimeToISO } from "../dates";
import { dailyPlanPayloadSchema, type DailyPlanPayload } from "../domain/schemas";
import { ServiceError } from "../errors";
import { buildDailyPlan, type BusyInterval } from "../planning/draft";
import type { DataStore } from "../data/repository";

export interface PlanningOptions {
  loadExternalCommitments?: (userId: string, date: string) => Promise<BusyInterval[]>;
  timeZone?: string;
}

export function createPlanningService(store: DataStore, options: PlanningOptions = {}) {
  const timeZone = () => options.timeZone || appTimeZone();

  return {
    async draft(userId: string, date = todayISO(new Date(), timeZone())) {
      const dayStart = zonedTimeToISO(date, 0, 0, timeZone());
      const dayEnd = zonedTimeToISO(date, 23, 59, timeZone());
      const [tasks, commitments, external] = await Promise.all([
        store.tasks.list(userId),
        store.commitments.list(userId, { from: dayStart, to: dayEnd }),
        options.loadExternalCommitments ? options.loadExternalCommitments(userId, date) : Promise.resolve([]),
      ]);
      return buildDailyPlan({
        date,
        tasks,
        commitments: [
          ...commitments.map((item) => ({ title: item.title, start: item.start, end: item.end })),
          ...external,
        ],
        timeZone: timeZone(),
      });
    },
    async save(userId: string, input: DailyPlanPayload) {
      let data: DailyPlanPayload;
      try {
        data = dailyPlanPayloadSchema.parse(input);
      } catch {
        throw new ServiceError("Daily plan payload is invalid");
      }
      return store.dailyPlans.create(userId, data);
    },
    async latest(userId: string, date?: string) {
      return store.dailyPlans.latest(userId, date);
    },
    async list(userId: string) {
      return store.dailyPlans.list(userId);
    },
  };
}

export type PlanningService = ReturnType<typeof createPlanningService>;
