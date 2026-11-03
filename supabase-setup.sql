-- In Supabase SQL Editor, run each statement separately, in order.
-- 1. Create the per-user progress table.
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tally jsonb not null default '{}',
  completed_tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 2. Enable row-level security.
alter table public.progress enable row level security;

-- 3. Remove the policy first if rerunning this setup.
drop policy if exists "users manage own progress" on public.progress;

-- 4. Allow each signed-in user to access only their own row.
create policy "users manage own progress" on public.progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Grant the dashboard the table operations it needs.
grant select, insert, update on public.progress to authenticated;
