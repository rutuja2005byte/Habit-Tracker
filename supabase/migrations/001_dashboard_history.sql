create extension if not exists pgcrypto;

create type goal_timeframe as enum ('daily', 'weekly', 'monthly', 'yearly');
create type goal_priority as enum ('Low', 'Medium', 'High');
create type goal_event_type as enum ('created', 'updated', 'completed', 'reopened', 'deleted');

create table if not exists public.dashboard_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timeframe goal_timeframe not null,
  name text not null,
  category text not null,
  description text,
  target_date date,
  priority goal_priority not null default 'Medium',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.dashboard_goal_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.dashboard_goals(id) on delete set null,
  event_type goal_event_type not null,
  timeframe goal_timeframe not null,
  goal_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.coding_profile_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  leetcode_username text,
  github_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.coding_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  leetcode_username text,
  github_username text,
  leetcode_solved integer not null default 0,
  leetcode_easy integer not null default 0,
  leetcode_medium integer not null default 0,
  leetcode_hard integer not null default 0,
  github_total_commits integer not null default 0,
  github_recent_commits integer not null default 0,
  github_pull_requests integer not null default 0,
  github_public_repos integer not null default 0,
  github_followers integer not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists dashboard_goals_user_timeframe_idx
  on public.dashboard_goals (user_id, timeframe, created_at desc);

create index if not exists dashboard_goal_history_user_created_idx
  on public.dashboard_goal_history (user_id, created_at desc);

create index if not exists coding_progress_snapshots_user_created_idx
  on public.coding_progress_snapshots (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dashboard_goals_set_updated_at on public.dashboard_goals;
create trigger dashboard_goals_set_updated_at
before update on public.dashboard_goals
for each row execute function public.set_updated_at();

drop trigger if exists coding_profile_connections_set_updated_at on public.coding_profile_connections;
create trigger coding_profile_connections_set_updated_at
before update on public.coding_profile_connections
for each row execute function public.set_updated_at();

alter table public.dashboard_goals enable row level security;
alter table public.dashboard_goal_history enable row level security;
alter table public.coding_profile_connections enable row level security;
alter table public.coding_progress_snapshots enable row level security;

create policy "Users can read their own goals"
on public.dashboard_goals for select
using (auth.uid() = user_id);

create policy "Users can create their own goals"
on public.dashboard_goals for insert
with check (auth.uid() = user_id);

create policy "Users can update their own goals"
on public.dashboard_goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own goals"
on public.dashboard_goals for delete
using (auth.uid() = user_id);

create policy "Users can read their own goal history"
on public.dashboard_goal_history for select
using (auth.uid() = user_id);

create policy "Users can create their own goal history"
on public.dashboard_goal_history for insert
with check (auth.uid() = user_id);

create policy "Users can read their own coding profiles"
on public.coding_profile_connections for select
using (auth.uid() = user_id);

create policy "Users can upsert their own coding profiles"
on public.coding_profile_connections for insert
with check (auth.uid() = user_id);

create policy "Users can update their own coding profiles"
on public.coding_profile_connections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own coding snapshots"
on public.coding_progress_snapshots for select
using (auth.uid() = user_id);

create policy "Users can create their own coding snapshots"
on public.coding_progress_snapshots for insert
with check (auth.uid() = user_id);
