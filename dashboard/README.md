# Productivity dashboard

A private Next.js app for tasks, projects, an inbox, a schedule, and an assistant that files proposals. It lives in this folder so the public portfolio site stays separate. The UI and the assistant call application services. Services validate with Zod. Only the data provider talks to storage.

There is no Notion, no MCP server, no Python service, and no Inngest. Google Calendar is read-only. The app never writes events.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the local password. Copy `.env.example` to `.env.local` if you want to change it. When `DEV_AUTH_PASSWORD` is unset, the password is `dev`.

```bash
npm test
npm run build
```

The default database is a SQLite file at `data/local.db`. It is created and seeded on first use. No cloud credentials are required.

## Environment

| Variable | Purpose |
| --- | --- |
| `DEV_AUTH_PASSWORD` | Local login password. Defaults to `dev`. |
| `SESSION_SECRET` | Signs the session cookie. |
| `APP_TIMEZONE` | Calendar day for “today”, overdue, and plans. Defaults to `America/New_York`. |
| `DATA_PROVIDER` | `sqlite` (default) or `supabase`. |
| `SUPABASE_URL` | Required only for the Supabase provider. |
| `SUPABASE_ANON_KEY` | Anon key. Use with `SUPABASE_ACCESS_TOKEN` so RLS (`user_id = auth.uid()`) applies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server key. Bypasses RLS. Queries still filter by user id. |
| `SUPABASE_ACCESS_TOKEN` | Optional user JWT sent with the anon key. |
| `OPENAI_API_KEY` | Streams assistant chat through the Vercel AI SDK. |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini`. |
| `GOOGLE_CLIENT_ID` | Read-only Calendar, together with the secret and refresh token. |
| `GOOGLE_CLIENT_SECRET` | Read-only Calendar. |
| `GOOGLE_REFRESH_TOKEN` | Read-only Calendar. |
| `CRON_SECRET` | Bearer token for the daily-plan route. |

## Supabase

Keep `DATA_PROVIDER=sqlite` for local development. To use Postgres:

1. Run `supabase/schema.sql` in the Supabase SQL editor. It creates the tables, foreign keys, and row-level security policies (`user_id = auth.uid()`).
2. Set `DATA_PROVIDER=supabase`, `SUPABASE_URL`, and either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` (plus `SUPABASE_ACCESS_TOKEN` for a signed-in user).
3. Restart the app. The SQLite file is not used in this mode.

The local password login does not create a Supabase Auth user. With the service role key, the provider writes the app user id and still filters every query by that id. With the anon key, RLS only returns rows whose `user_id` equals `auth.uid()`.

## Daily plan cron

`GET` or `POST` `/api/cron/daily-plan` with `Authorization: Bearer $CRON_SECRET`.

The route files a `propose_daily_plan` action for the local user. It does not save a `daily_plans` row. Approve the proposal on the Assistant page to store the plan. The route does not call an external scheduler. If `CRON_SECRET` is unset, the route responds with 500.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-plan
```

On Vercel later, point a cron job at that path and set `CRON_SECRET`. A button on the dashboard files the same kind of proposal.

## Assistant

With `OPENAI_API_KEY`, chat streams through `ai` and `@ai-sdk/openai`. Tools that change data only insert `agent_actions` rows with status `proposed`. Approve runs the matching service and marks the action `executed`. Reject marks it `rejected`.

Without a key, the assistant still handles “create task: …”, “list tasks”, and “propose a daily plan” through those same proposal methods.
