import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { proposeDailyPlanAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { formatDue, formatLongDate, todayISO } from "@/lib/dates";
import type { Task } from "@/lib/domain/types";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/labels";
import { services } from "@/lib/services";

export const metadata = { title: "Today" };

export default async function DashboardPage() {
  const userId = await requireUserId();
  const today = todayISO();
  const [tasks, projects, plan] = await Promise.all([
    services().tasks.list(userId),
    services().projects.list(userId),
    services().planning.latest(userId, today),
  ]);
  const names = new Map(projects.map((project) => [project.id, project.name]));
  const open = tasks.filter((task) => task.status !== "completed");
  const overdue = open.filter((task) => task.dueDate && task.dueDate < today);
  const dueToday = open.filter((task) => task.dueDate === today);
  const active = projects.filter((project) => project.status === "active");
  const whatNow =
    open.find((task) => task.status === "in_progress") ??
    dueToday[0] ??
    overdue[0] ??
    open.find((task) => task.status === "ready");
  const whatNext = open
    .filter((task) => task.id !== whatNow?.id && (task.status === "ready" || task.status === "in_progress"))
    .slice(0, 4);
  const deadlines = [
    ...open
      .filter((task) => task.dueDate)
      .map((task) => ({ date: task.dueDate!, label: task.title, kind: "Task" as const })),
    ...active
      .filter((project) => project.targetDate)
      .map((project) => ({ date: project.targetDate!, label: project.name, kind: "Project" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const nextDeadline = deadlines[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">What now / what next</p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{formatLongDate(today)}</h1>
        </div>
        <form action={proposeDailyPlanAction}>
          <Button type="submit">Propose daily plan</Button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="bg-pine p-6 text-paper md:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">What now</p>
          {whatNow ? (
            <>
              <h2 className="mt-3 font-display text-4xl leading-tight">{whatNow.title}</h2>
              <p className="mt-3 text-sm text-white/80">
                {TASK_STATUS_LABEL[whatNow.status]} · {PRIORITY_LABEL[whatNow.priority]}
                {whatNow.projectId ? ` · ${names.get(whatNow.projectId) ?? "Project"}` : ""}
                {whatNow.estimatedMinutes ? ` · ${whatNow.estimatedMinutes} min` : ""}
                {whatNow.dueDate ? ` · ${formatDue(whatNow.dueDate, today)}` : ""}
              </p>
              <div className="mt-6">
                <Link href={`/tasks?edit=${whatNow.id}`} className="text-sm underline decoration-white/40 underline-offset-4">
                  Open task
                </Link>
              </div>
            </>
          ) : (
            <h2 className="mt-3 font-display text-4xl">Nothing in progress.</h2>
          )}
        </Card>
        <Card className="p-6">
          <p className="eyebrow">What next</p>
          {whatNext.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No ready tasks after this one.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {whatNext.map((task, index) => (
                <li key={task.id} className="flex gap-3">
                  <span className="font-display text-2xl text-muted">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted">{formatDue(task.dueDate, today) ?? "No due date"}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TaskGroup title="Today" tasks={dueToday} today={today} names={names} empty="Nothing is due today." />
        <TaskGroup title="Overdue" tasks={overdue} today={today} names={names} empty="No overdue tasks." tone="warn" />
        <Card className="p-5">
          <p className="eyebrow">Active projects</p>
          {active.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No active projects.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {active.map((project) => (
                <li key={project.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted">
                      {project.targetDate ? `Target ${formatDue(project.targetDate, today)}` : "No target date"}
                    </p>
                  </div>
                  <Badge value={project.priority} label={PRIORITY_LABEL[project.priority]} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Next deadline</p>
          {nextDeadline ? (
            <>
              <p className="mt-3 font-display text-3xl">{formatDue(nextDeadline.date, today)}</p>
              <p className="mt-1 text-sm text-muted">
                {nextDeadline.kind} · {nextDeadline.label}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">No upcoming deadline.</p>
          )}
          {plan ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="eyebrow">Saved plan</p>
              <p className="mt-2 text-sm leading-6 text-ink">{plan.summary}</p>
            </div>
          ) : (
            <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
              No saved plan for today. Propose one, then approve it.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  today,
  names,
  empty,
  tone,
}: {
  title: string;
  tasks: Task[];
  today: string;
  names: Map<string, string>;
  empty: string;
  tone?: "warn";
}) {
  return (
    <Card className="p-5">
      <p className="eyebrow">{title}</p>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-medium ${tone === "warn" ? "text-clay" : ""}`}>{task.title}</p>
                <p className="text-xs text-muted">
                  {task.projectId ? names.get(task.projectId) : "No project"} · {TASK_STATUS_LABEL[task.status]}
                </p>
              </div>
              <Badge value={task.priority} label={PRIORITY_LABEL[task.priority]} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
