import type { AgentService } from "../services/agent-service";
import { services } from "../services";
import type { Priority } from "../domain/types";

const KEY_NOTE = "Set OPENAI_API_KEY to enable full chat.";

function priorityFromTitle(title: string): { title: string; priority: Priority } {
  const match = title.match(/\b(high|medium|low)\s+priority\b/i);
  if (!match) return { title: title.trim(), priority: "medium" };
  const priority = match[1]!.toLowerCase() as Priority;
  const cleaned = title.replace(match[0], "").replace(/\s{2,}/g, " ").replace(/[,\-–—]\s*$/g, "").trim();
  return { title: cleaned, priority };
}

/**
 * Deterministic local assistant. It calls the same propose methods as the
 * model tools and never writes tasks, projects, or plans directly.
 */
export async function runFallback(userId: string, message: string, agent: AgentService = services().agent) {
  const text = message.trim();
  const createMatch = text.match(/^(?:please\s+)?(?:create|add|make)\s+(?:a\s+)?task[:\s-]+(.+)$/i);

  if (createMatch) {
    const parsed = priorityFromTitle(createMatch[1]!.replace(/[.]+$/g, "").trim());
    if (!parsed.title) {
      return `Say “create task: ” followed by a title. ${KEY_NOTE}`;
    }
    const action = await agent.proposeTask(userId, {
      title: parsed.title,
      priority: parsed.priority,
      status: "ready",
    });
    return `Proposed a task “${parsed.title}” (${parsed.priority}). It is waiting for approval (${action.id.slice(0, 8)}) and has not been created. ${KEY_NOTE}`;
  }

  if (/^(?:list|show|get)\s+(?:my\s+)?tasks\b/i.test(text) || /^tasks$/i.test(text)) {
    const tasks = await agent.getTasks(userId);
    if (tasks.length === 0) return `No tasks yet. ${KEY_NOTE}`;
    const lines = tasks.slice(0, 20).map((task) => `• ${task.title} — ${task.status}, ${task.priority}`);
    return `${lines.join("\n")}\n\n${KEY_NOTE}`;
  }

  if (/\bdaily plan\b|\bplan my day\b|\bpropose a plan\b/i.test(text)) {
    const action = await agent.proposeDailyPlan(userId);
    const payload = action.payload as { date?: string; summary?: string };
    return `Proposed a daily plan for ${payload.date ?? "today"}. Approve it to save the plan.\n\n${payload.summary ?? ""}\n\n${KEY_NOTE}`;
  }

  return `Without an API key I can “create task: …”, “list tasks”, and “propose a daily plan”. ${KEY_NOTE}`;
}
