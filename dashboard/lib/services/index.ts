import { getStore } from "../data";
import { isGoogleConfigured, listGoogleEvents } from "../integrations/google-calendar";
import { createAgentService, type AgentService } from "./agent-service";
import { createCommitmentService } from "./commitment-service";
import { createInboxService } from "./inbox-service";
import { createNoteService } from "./note-service";
import { createPlanningService } from "./planning-service";
import { createProjectService } from "./project-service";
import { createTaskService } from "./task-service";

export interface AppServices {
  tasks: ReturnType<typeof createTaskService>;
  projects: ReturnType<typeof createProjectService>;
  inbox: ReturnType<typeof createInboxService>;
  notes: ReturnType<typeof createNoteService>;
  commitments: ReturnType<typeof createCommitmentService>;
  planning: ReturnType<typeof createPlanningService>;
  agent: AgentService;
}

let cached: AppServices | null = null;

export function services(): AppServices {
  if (cached) return cached;
  const store = getStore();
  const external = async (_userId: string, date: string) => {
    if (!isGoogleConfigured()) return [];
    const events = await listGoogleEvents(date);
    return events.map((event) => ({ title: event.title, start: event.start, end: event.end }));
  };
  cached = {
    tasks: createTaskService(store),
    projects: createProjectService(store),
    inbox: createInboxService(store),
    notes: createNoteService(store),
    commitments: createCommitmentService(store),
    planning: createPlanningService(store, { loadExternalCommitments: external }),
    agent: createAgentService(store, { loadExternalCommitments: external }),
  };
  return cached;
}

export async function readGoogleDay(date: string) {
  if (!isGoogleConfigured()) {
    return { connected: false as const, events: [], error: null as string | null };
  }
  try {
    const events = await listGoogleEvents(date);
    return { connected: true as const, events, error: null as string | null };
  } catch (error) {
    return {
      connected: true as const,
      events: [],
      error: error instanceof Error ? error.message : "Google Calendar could not be read",
    };
  }
}
