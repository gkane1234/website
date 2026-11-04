import { convertToCoreMessages, streamText, type Message } from "ai";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { readCookie, verifySessionToken } from "@/lib/auth/session";
import { runFallback } from "@/lib/agent/fallback";
import { assistantTools } from "@/lib/agent/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are the in-app productivity assistant for one person.
You may read tasks, projects, and inbox items with the get_* tools.
You must not claim that a task, project, or plan was saved.
To change anything, call propose_task, propose_task_update, propose_project, or propose_daily_plan.
Those tools only file a proposal. The person approves or rejects it on the assistant page.
Be brief. Use the tools instead of inventing task lists.`;

export async function POST(request: Request) {
  const userId = await userIdFrom(request);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { messages?: Message[] };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const latestUser = [...messages].reverse().find((message) => message.role === "user");
  const text = typeof latestUser?.content === "string" ? latestUser.content : "";

  if (!process.env.OPENAI_API_KEY) {
    const content = await runFallback(userId, text);
    return Response.json({ role: "assistant", content });
  }

  const { openai } = await import("@ai-sdk/openai");
  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    system: SYSTEM,
    messages: convertToCoreMessages(messages),
    tools: assistantTools(userId),
    maxSteps: 4,
  });
  return result.toDataStreamResponse();
}

async function userIdFrom(request: Request) {
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}
