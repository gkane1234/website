import Link from "next/link";
import { Badge, Button, Card, Field, Flash } from "@/components/ui";
import { completeTaskAction, createNoteAction, createTaskAction, deleteTaskAction, updateTaskAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { formatDue, isoToLocalInput, todayISO } from "@/lib/dates";
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from "@/lib/domain/types";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/labels";
import { enumOrUndefined, one } from "@/lib/search";
import { services } from "@/lib/services";

export const metadata = { title: "Tasks" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const userId = await requireUserId();
  const today = todayISO();
  const projects = await services().projects.list(userId);
  const status = enumOrUndefined(one(searchParams.status), TASK_STATUSES);
  const priority = enumOrUndefined(one(searchParams.priority), PRIORITIES);
  const projectId = projects.some((project) => project.id === one(searchParams.project)) ? one(searchParams.project) : undefined;
  const overdue = one(searchParams.overdue) === "1";
  const tasks = await services().tasks.list(userId, {
    status,
    priority,
    projectId,
    overdue,
    today,
  });
  const editing = tasks.find((task) => task.id === one(searchParams.edit)) ?? (one(searchParams.edit) ? await services().tasks.get(userId, one(searchParams.edit)!) : null);
  const notes = editing ? await services().notes.list(userId, { taskId: editing.id }) : [];
  const names = new Map(projects.map((project) => [project.id, project.name]));
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (priority) query.set("priority", priority);
  if (projectId) query.set("project", projectId);
  if (overdue) query.set("overdue", "1");
  const returnTo = query.size ? `/tasks?${query.toString()}` : "/tasks";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Work</p>
        <h1 className="mt-2 font-display text-4xl">Tasks</h1>
      </div>
      <Flash error={one(searchParams.error)} notice={one(searchParams.notice)} />

      <Card className="p-5">
        <form className="grid gap-3 md:grid-cols-5 md:items-end" action="/tasks">
          <Field label="Project">
            <select className="field" name="project" defaultValue={projectId ?? ""}>
              <option value="">All</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="field" name="status" defaultValue={status ?? ""}>
              <option value="">All</option>
              {TASK_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {TASK_STATUS_LABEL[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className="field" name="priority" defaultValue={priority ?? ""}>
              <option value="">All</option>
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {PRIORITY_LABEL[item]}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="overdue" value="1" defaultChecked={overdue} />
            Overdue
          </label>
          <Button type="submit" variant="paper">
            Apply filters
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {editing ? (
            <Card className="p-5">
              <p className="eyebrow">Edit task</p>
              <form action={updateTaskAction} className="mt-4 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="id" value={editing.id} />
                <div className="md:col-span-2">
                  <Field label="Title">
                    <input className="field" name="title" defaultValue={editing.title} required />
                  </Field>
                </div>
                <StatusFields projects={projects} status={editing.status} priority={editing.priority} projectId={editing.projectId} />
                <Field label="Due">
                  <input className="field" type="date" name="dueDate" defaultValue={editing.dueDate ?? ""} />
                </Field>
                <Field label="Estimate (minutes)">
                  <input className="field" type="number" min={1} name="estimatedMinutes" defaultValue={editing.estimatedMinutes ?? ""} />
                </Field>
                <Field label="Scheduled start">
                  <input className="field" type="datetime-local" name="scheduledStart" defaultValue={isoToLocalInput(editing.scheduledStart)} />
                </Field>
                <Field label="Scheduled end">
                  <input className="field" type="datetime-local" name="scheduledEnd" defaultValue={isoToLocalInput(editing.scheduledEnd)} />
                </Field>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">Save</Button>
                  <Link href={returnTo} className="inline-flex items-center rounded-full px-4 py-2 text-sm text-muted">
                    Cancel
                  </Link>
                </div>
              </form>
              <div className="mt-5 border-t border-line pt-4">
                <p className="eyebrow">Notes</p>
                {notes.length === 0 ? <p className="mt-2 text-sm text-muted">No notes on this task.</p> : null}
                <ul className="mt-2 space-y-2">
                  {notes.map((note) => (
                    <li key={note.id} className="text-sm leading-6">
                      {note.body}
                    </li>
                  ))}
                </ul>
                <form action={createNoteAction} className="mt-3 flex gap-2">
                  <input type="hidden" name="taskId" value={editing.id} />
                  <input type="hidden" name="projectId" value={editing.projectId ?? ""} />
                  <input type="hidden" name="returnTo" value={`${returnTo}${returnTo.includes("?") ? "&" : "?"}edit=${editing.id}`} />
                  <input className="field" name="body" placeholder="Add a note" />
                  <Button type="submit" variant="paper">
                    Add
                  </Button>
                </form>
              </div>
            </Card>
          ) : null}

          {tasks.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-line px-5 py-8 text-sm text-muted">No tasks match these filters.</p>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className={`px-4 py-4 ${task.dueDate && task.dueDate < today && task.status !== "completed" ? "border-clay/30" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={`font-medium ${task.status === "completed" ? "text-muted line-through" : ""}`}>{task.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {task.projectId ? names.get(task.projectId) : "No project"}
                      {" · "}
                      {formatDue(task.dueDate, today) ?? "No due date"}
                      {task.estimatedMinutes ? ` · ${task.estimatedMinutes} min` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge value={task.status} label={TASK_STATUS_LABEL[task.status]} />
                      <Badge value={task.priority} label={PRIORITY_LABEL[task.priority]} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== "completed" ? (
                      <form action={completeTaskAction}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <Button type="submit" variant="paper">
                          Complete
                        </Button>
                      </form>
                    ) : null}
                    <Link
                      href={`${returnTo}${returnTo.includes("?") ? "&" : "?"}edit=${task.id}`}
                      className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm"
                    >
                      Edit
                    </Link>
                    <form action={deleteTaskAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <Button type="submit" variant="danger">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit p-5">
          <p className="eyebrow">New task</p>
          <form action={createTaskAction} className="mt-4 space-y-3">
            <input type="hidden" name="returnTo" value={returnTo} />
            <Field label="Title">
              <input className="field" name="title" required placeholder="What needs doing?" />
            </Field>
            <StatusFields projects={projects} />
            <Field label="Due">
              <input className="field" type="date" name="dueDate" />
            </Field>
            <Field label="Estimate (minutes)">
              <input className="field" type="number" min={1} name="estimatedMinutes" placeholder="30" />
            </Field>
            <Button type="submit">Create task</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function StatusFields({
  projects,
  status = "ready",
  priority = "medium",
  projectId = null,
}: {
  projects: { id: string; name: string }[];
  status?: TaskStatus;
  priority?: Priority;
  projectId?: string | null;
}) {
  return (
    <>
      <Field label="Project">
        <select className="field" name="projectId" defaultValue={projectId ?? ""}>
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select className="field" name="status" defaultValue={status}>
          {TASK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {TASK_STATUS_LABEL[item]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Priority">
        <select className="field" name="priority" defaultValue={priority}>
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {PRIORITY_LABEL[item]}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}
