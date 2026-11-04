import type {
  AgentAction,
  AgentActionStatus,
  Commitment,
  CommitmentListFilters,
  DailyPlan,
  InboxItem,
  Note,
  Project,
  Task,
  TaskListFilters,
} from "../domain/types";
import type {
  CommitmentCreateInput,
  DailyPlanPayload,
  InboxCreateInput,
  NoteCreateInput,
  ProjectCreateInput,
  ProjectPatchInput,
  TaskCreateInput,
  TaskPatchInput,
} from "../domain/schemas";

export interface ProjectRepository {
  list(userId: string): Promise<Project[]>;
  get(userId: string, id: string): Promise<Project | null>;
  create(userId: string, input: ProjectCreateInput & { id?: string }): Promise<Project>;
  update(userId: string, id: string, patch: ProjectPatchInput): Promise<Project | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface TaskRepository {
  list(userId: string, filters?: TaskListFilters): Promise<Task[]>;
  get(userId: string, id: string): Promise<Task | null>;
  create(userId: string, input: TaskCreateInput & { id?: string }): Promise<Task>;
  update(userId: string, id: string, patch: TaskPatchInput): Promise<Task | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface NoteRepository {
  list(userId: string, filters?: { projectId?: string; taskId?: string }): Promise<Note[]>;
  create(userId: string, input: NoteCreateInput & { id?: string; createdAt?: string }): Promise<Note>;
}

export interface InboxRepository {
  list(userId: string): Promise<InboxItem[]>;
  create(userId: string, input: InboxCreateInput & { id?: string; capturedAt?: string }): Promise<InboxItem>;
}

export interface CommitmentRepository {
  list(userId: string, filters?: CommitmentListFilters): Promise<Commitment[]>;
  create(userId: string, input: CommitmentCreateInput & { id?: string; createdAt?: string }): Promise<Commitment>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface DailyPlanRepository {
  list(userId: string): Promise<DailyPlan[]>;
  latest(userId: string, date?: string): Promise<DailyPlan | null>;
  create(userId: string, input: DailyPlanPayload & { id?: string; generatedAt?: string }): Promise<DailyPlan>;
}

export interface AgentActionRepository {
  list(userId: string, status?: AgentActionStatus): Promise<AgentAction[]>;
  get(userId: string, id: string): Promise<AgentAction | null>;
  create(
    userId: string,
    input: { toolName: string; payload: unknown; status?: AgentActionStatus; id?: string; createdAt?: string },
  ): Promise<AgentAction>;
  compareAndSet(
    userId: string,
    id: string,
    from: AgentActionStatus,
    to: AgentActionStatus,
  ): Promise<AgentAction | null>;
}

/**
 * The only storage boundary. Services depend on this interface.
 * Screens and agent tools never see a database client.
 */
export interface DataStore {
  projects: ProjectRepository;
  tasks: TaskRepository;
  notes: NoteRepository;
  inbox: InboxRepository;
  commitments: CommitmentRepository;
  dailyPlans: DailyPlanRepository;
  agentActions: AgentActionRepository;
}
