-- Ambrosia PLATO V2 Database Schema for Supabase
-- Profiles: one row per user, created automatically on signup
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select using ((select auth.uid()) = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check ((select auth.uid()) = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Cloud sync table (per-user app data), protected by Row Level Security
create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  record_id text not null,
  payload jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, table_name, record_id)
);

alter table public.user_data enable row level security;

drop policy if exists "user_data select own" on public.user_data;
create policy "user_data select own" on public.user_data for select using ((select auth.uid()) = user_id);

drop policy if exists "user_data insert own" on public.user_data;
create policy "user_data insert own" on public.user_data for insert with check ((select auth.uid()) = user_id);

drop policy if exists "user_data update own" on public.user_data;
create policy "user_data update own" on public.user_data for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "user_data delete own" on public.user_data;
create policy "user_data delete own" on public.user_data for delete using ((select auth.uid()) = user_id);

create index if not exists user_data_sync_idx on public.user_data (user_id, updated_at);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch before insert or update on public.user_data
for each row execute function public.touch_updated_at();
