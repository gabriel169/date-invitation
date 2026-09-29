-- Run once in the Supabase SQL editor.
create table if not exists public.date_responses (
  id uuid primary key default gen_random_uuid(),
  response text not null check (response in ('yes', 'no')),
  created_at timestamptz not null default now()
);

alter table public.date_responses enable row level security;

-- The public (anon) key may only INSERT. It cannot read, edit or delete rows.
create policy "anon can insert responses"
  on public.date_responses for insert to anon
  with check (response in ('yes', 'no'));
