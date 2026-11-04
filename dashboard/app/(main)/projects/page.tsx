import Link from "next/link";
import { Badge, Button, Card, Field, Flash } from "@/components/ui";
import { createProjectAction, deleteProjectAction, updateProjectAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { formatDue, todayISO } from "@/lib/dates";
import { PRIORITIES, PROJECT_STATUSES, type Priority, type ProjectStatus } from "@/lib/domain/types";
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL } from "@/lib/labels";
import { one } from "@/lib/search";
import { services } from "@/lib/services";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const userId = await requireUserId();
  const today = todayISO();
  const [projects, tasks] = await Promise.all([services().projects.list(userId), services().tasks.list(userId)]);
  const editing = one(searchParams.edit) ? await services().projects.get(userId, one(searchParams.edit)!) : null;
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!task.projectId || task.status === "completed") continue;
    counts.set(task.projectId, (counts.get(task.projectId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Work</p>
        <h1 className="mt-2 font-display text-4xl">Projects</h1>
      </div>
      <Flash error={one(searchParams.error)} notice={one(searchParams.notice)} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {editing ? (
            <Card className="p-5">
              <p className="eyebrow">Edit project</p>
              <ProjectForm action={updateProjectAction} project={editing} />
            </Card>
          ) : null}
          {projects.length === 0 ? <p className="text-sm text-muted">No projects yet.</p> : null}
          {projects.map((project) => (
            <Card key={project.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{project.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{project.description || "No description."}</p>
                  <p className="mt-2 text-xs text-muted">
                    {counts.get(project.id) ?? 0} open tasks
                    {project.targetDate ? ` · target ${formatDue(project.targetDate, today)}` : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge value={project.status} label={PROJECT_STATUS_LABEL[project.status]} />
                    <Badge value={project.priority} label={PRIORITY_LABEL[project.priority]} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/projects?edit=${project.id}`} className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm">
                    Edit
                  </Link>
                  <form action={deleteProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button type="submit" variant="danger">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="h-fit p-5">
          <p className="eyebrow">New project</p>
          <ProjectForm action={createProjectAction} />
        </Card>
      </div>
    </div>
  );
}

function ProjectForm({
  action,
  project,
}: {
  action: (formData: FormData) => Promise<void>;
  project?: {
    id: string;
    name: string;
    status: ProjectStatus;
    priority: Priority;
    description: string;
    targetDate: string | null;
  };
}) {
  return (
    <form action={action} className="mt-4 space-y-3">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <Field label="Name">
        <input className="field" name="name" required defaultValue={project?.name ?? ""} />
      </Field>
      <Field label="Description">
        <textarea className="field min-h-24" name="description" defaultValue={project?.description ?? ""} />
      </Field>
      <Field label="Status">
        <select className="field" name="status" defaultValue={project?.status ?? "active"}>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Priority">
        <select className="field" name="priority" defaultValue={project?.priority ?? "medium"}>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Target date">
        <input className="field" type="date" name="targetDate" defaultValue={project?.targetDate ?? ""} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">{project ? "Save" : "Create project"}</Button>
        {project ? (
          <Link href="/projects" className="inline-flex items-center px-3 text-sm text-muted">
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
