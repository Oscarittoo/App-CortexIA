-- CORTEXIA - Supabase schema
-- Exécuter dans Supabase SQL Editor

create table if not exists public.clients (
  id uuid primary key,
  email text unique not null,
  company_name text,
  plan text not null default 'free',
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  last_updated timestamptz not null default now()
);

alter table public.clients enable row level security;

-- Policies (à adapter selon votre besoin)
create policy "Clients can read own row"
  on public.clients for select
  using (auth.uid() = id);

create policy "Clients can update own row"
  on public.clients for update
  using (auth.uid() = id);

create policy "Clients can insert own row"
  on public.clients for insert
  with check (auth.uid() = id);
