import { AssistantChat } from "@/components/assistant-chat";
import { Badge, Button, Card, Flash } from "@/components/ui";
import { approveAction, rejectAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { formatDateTime, formatTime } from "@/lib/dates";
import type { AgentAction, Task } from "@/lib/domain/types";
import { TOOL_LABEL } from "@/lib/labels";
import { one } from "@/lib/search";
import { services } from "@/lib/services";

export const metadata = { title: "Assistant" };

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const userId = await requireUserId();
  const [actions, tasks] = await Promise.all([
    services().agent.listActions(userId),
    services().tasks.list(userId),
  ]);
  const proposed = actions.filter((action) => action.status === "proposed");
  const history = actions.filter((action) => action.status !== "proposed").slice(0, 12);
  const aiEnabled = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Proposals</p>
        <h1 className="mt-2 font-display text-4xl">Assistant</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The assistant can read your tasks and file proposals. Approve runs the matching service. Reject leaves your
          data unchanged.
        </p>
      </div>
      <Flash error={one(searchParams.error)} notice={one(searchParams.notice)} />
      <div className="grid items-start gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <AssistantChat aiEnabled={aiEnabled} />
        <div className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow">Waiting for approval</p>
            {proposed.length === 0 ? <p className="mt-3 text-sm text-muted">No open proposals.</p> : null}
            <ul className="mt-3 space-y-4">
              {proposed.map((action) => (
                <li key={action.id} className="rounded-2xl bg-sand/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{TOOL_LABEL[action.toolName] ?? action.toolName}</p>
                    <Badge value={action.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6">{describeAction(action, tasks)}</p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(action.createdAt)}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={approveAction}>
                      <input type="hidden" name="id" value={action.id} />
                      <Button type="submit">Approve</Button>
                    </form>
                    <form action={rejectAction}>
                      <input type="hidden" name="id" value={action.id} />
                      <Button type="submit" variant="danger">
                        Reject
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">Recent decisions</p>
            {history.length === 0 ? <p className="mt-3 text-sm text-muted">Nothing decided yet.</p> : null}
            <ul className="mt-3 space-y-3">
              {history.map((action) => (
                <li key={action.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">{describeAction(action, tasks)}</p>
                    <p className="text-xs text-muted">
                      {TOOL_LABEL[action.toolName] ?? action.toolName}
                      {action.executedAt ? ` · ${formatDateTime(action.executedAt)}` : ` · ${formatDateTime(action.createdAt)}`}
                    </p>
                  </div>
                  <Badge value={action.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function describeAction(action: AgentAction, tasks: Task[]) {
  const payload = (action.payload ?? {}) as {
    title?: string;
    name?: string;
    summary?: string;
    date?: string;
    taskId?: string;
    patch?: Record<string, unknown>;
    blocks?: { taskId: string; start: string; end: string }[];
  };
  if (action.toolName === "propose_task") return payload.title || "New task";
  if (action.toolName === "propose_project") return payload.name || "New project";
  if (action.toolName === "propose_task_update") {
    const task = tasks.find((item) => item.id === payload.taskId);
    const fields = payload.patch ? Object.keys(payload.patch).join(", ") : "update";
    const when =
      typeof payload.patch?.scheduledStart === "string" && typeof payload.patch?.scheduledEnd === "string"
        ? ` ${formatTime(payload.patch.scheduledStart)}–${formatTime(payload.patch.scheduledEnd)}`
        : "";
    return `${task?.title ?? "Task"} · ${fields}${when}`;
  }
  if (action.toolName === "propose_daily_plan") {
    const lines = (payload.blocks ?? []).slice(0, 4).map((block) => {
      const task = tasks.find((item) => item.id === block.taskId);
      return `${formatTime(block.start)} ${task?.title ?? "Task"}`;
    });
    return [payload.summary, lines.join(" · ")].filter(Boolean).join(" ");
  }
  return action.toolName;
}
