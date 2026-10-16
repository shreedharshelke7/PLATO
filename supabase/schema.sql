-- Ambrosia PLATO V2 Cloud Sync Schema for Supabase
-- Row Level Security (RLS) enabled: each authenticated user can only access their own synchronized rows.

create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  record_id text not null,
  payload jsonb not null,
  client_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false,
  unique (user_id, table_name, record_id)
);

alter table public.user_data enable row level security;

create policy "select own" on public.user_data for select using ((select auth.uid()) = user_id);
create policy "insert own" on public.user_data for insert with check ((select auth.uid()) = user_id);
create policy "update own" on public.user_data for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own" on public.user_data for delete using ((select auth.uid()) = user_id);

create index if not exists user_data_sync_idx on public.user_data (user_id, updated_at);
create index if not exists user_data_lookup_idx on public.user_data (user_id, table_name, record_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch before insert or update on public.user_data
for each row execute function public.touch_updated_at();
