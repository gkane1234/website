import { LOCAL_USER_ID } from "@/lib/auth/constants";
import { todayISO } from "@/lib/dates";
import { services } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron can call this later. It only files a propose_daily_plan action.
 * Approving that action stores the daily_plans row. This route does not call
 * an external scheduler and does not write to Google Calendar.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }
  const header = request.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!safeEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = todayISO();
  const action = await services().agent.proposeDailyPlanOnce(LOCAL_USER_ID, date);
  return Response.json({
    ok: true,
    date,
    actionId: action.id,
    status: action.status,
    message: "Proposal filed. Approve it in the assistant to store the daily plan.",
  });
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
