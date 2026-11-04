-- Productivity dashboard schema for Supabase Postgres.
-- Apply in the Supabase SQL editor. The local app does not need this file to boot.
-- SQLite in dashboard/data/local.db is the default provider.
--
-- Domain foreign keys live between projects, tasks, and notes.
-- user_id is compared to auth.uid() by RLS. It is not a foreign key to auth.users
-- so a server-side provider can store the app's user id. Add that foreign key
-- if every row is written by a Supabase Auth user.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  status text not null check (status in ('active', 'paused', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  description text not null default '',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  project_id uuid references public.projects(id) on delete set null,
  status text not null check (status in ('inbox', 'ready', 'in_progress', 'completed', 'blocked')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  due_date date,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  body text not null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  body text not null,
  captured_at timestamptz not null default now(),
  status text not null check (status in ('new', 'processed', 'discarded'))
);

create table if not exists public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  recurrence text,
  source text not null check (source in ('app', 'google')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_date date not null,
  summary text not null,
  ordered_task_ids jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tool_name text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('proposed', 'approved', 'rejected', 'executed')),
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create index if not exists projects_user_idx on public.projects(user_id);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists tasks_user_due_idx on public.tasks(user_id, due_date);
create index if not exists notes_user_idx on public.notes(user_id);
create index if not exists inbox_user_idx on public.inbox_items(user_id, captured_at desc);
create index if not exists commitments_user_idx on public.commitments(user_id, starts_at);
create index if not exists daily_plans_user_idx on public.daily_plans(user_id, plan_date);
create index if not exists agent_actions_user_idx on public.agent_actions(user_id, created_at desc);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.inbox_items enable row level security;
alter table public.commitments enable row level security;
alter table public.daily_plans enable row level security;
alter table public.agent_actions enable row level security;

-- Policies are re-runnable.
drop policy if exists projects_select_own on public.projects;
drop policy if exists projects_insert_own on public.projects;
drop policy if exists projects_update_own on public.projects;
drop policy if exists projects_delete_own on public.projects;
create policy projects_select_own on public.projects for select using (user_id = auth.uid());
create policy projects_insert_own on public.projects for insert with check (user_id = auth.uid());
create policy projects_update_own on public.projects for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy projects_delete_own on public.projects for delete using (user_id = auth.uid());

drop policy if exists tasks_select_own on public.tasks;
drop policy if exists tasks_insert_own on public.tasks;
drop policy if exists tasks_update_own on public.tasks;
drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_select_own on public.tasks for select using (user_id = auth.uid());
create policy tasks_insert_own on public.tasks for insert with check (user_id = auth.uid());
create policy tasks_update_own on public.tasks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tasks_delete_own on public.tasks for delete using (user_id = auth.uid());

drop policy if exists notes_select_own on public.notes;
drop policy if exists notes_insert_own on public.notes;
drop policy if exists notes_update_own on public.notes;
drop policy if exists notes_delete_own on public.notes;
create policy notes_select_own on public.notes for select using (user_id = auth.uid());
create policy notes_insert_own on public.notes for insert with check (user_id = auth.uid());
create policy notes_update_own on public.notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_delete_own on public.notes for delete using (user_id = auth.uid());

drop policy if exists inbox_select_own on public.inbox_items;
drop policy if exists inbox_insert_own on public.inbox_items;
drop policy if exists inbox_update_own on public.inbox_items;
drop policy if exists inbox_delete_own on public.inbox_items;
create policy inbox_select_own on public.inbox_items for select using (user_id = auth.uid());
create policy inbox_insert_own on public.inbox_items for insert with check (user_id = auth.uid());
create policy inbox_update_own on public.inbox_items for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy inbox_delete_own on public.inbox_items for delete using (user_id = auth.uid());

drop policy if exists commitments_select_own on public.commitments;
drop policy if exists commitments_insert_own on public.commitments;
drop policy if exists commitments_update_own on public.commitments;
drop policy if exists commitments_delete_own on public.commitments;
create policy commitments_select_own on public.commitments for select using (user_id = auth.uid());
create policy commitments_insert_own on public.commitments for insert with check (user_id = auth.uid());
create policy commitments_update_own on public.commitments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy commitments_delete_own on public.commitments for delete using (user_id = auth.uid());

drop policy if exists daily_plans_select_own on public.daily_plans;
drop policy if exists daily_plans_insert_own on public.daily_plans;
drop policy if exists daily_plans_update_own on public.daily_plans;
drop policy if exists daily_plans_delete_own on public.daily_plans;
create policy daily_plans_select_own on public.daily_plans for select using (user_id = auth.uid());
create policy daily_plans_insert_own on public.daily_plans for insert with check (user_id = auth.uid());
create policy daily_plans_update_own on public.daily_plans for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy daily_plans_delete_own on public.daily_plans for delete using (user_id = auth.uid());

drop policy if exists agent_actions_select_own on public.agent_actions;
drop policy if exists agent_actions_insert_own on public.agent_actions;
drop policy if exists agent_actions_update_own on public.agent_actions;
drop policy if exists agent_actions_delete_own on public.agent_actions;
create policy agent_actions_select_own on public.agent_actions for select using (user_id = auth.uid());
create policy agent_actions_insert_own on public.agent_actions for insert with check (user_id = auth.uid());
create policy agent_actions_update_own on public.agent_actions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy agent_actions_delete_own on public.agent_actions for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.inbox_items to authenticated;
grant select, insert, update, delete on public.commitments to authenticated;
grant select, insert, update, delete on public.daily_plans to authenticated;
grant select, insert, update, delete on public.agent_actions to authenticated;
