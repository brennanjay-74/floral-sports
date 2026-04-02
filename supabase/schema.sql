create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  nickname text not null,
  avatar_icon text default '⚽️',
  phone_number text,
  favorite_sport text,
  notification_pref text default 'in_app',
  role text default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.event_series (
  id uuid primary key default gen_random_uuid(),
  sport_type text not null,
  title text not null,
  location text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  organizer_id uuid references public.profiles(id) on delete set null,
  organizer_name text,
  notes text,
  equipment_needed text,
  weather_note text,
  recurrence_rule jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.event_series(id) on delete cascade,
  sport_type text not null,
  title text not null,
  location text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  organizer_id uuid references public.profiles(id) on delete set null,
  organizer_name text,
  notes text,
  equipment_needed text,
  weather_note text,
  is_recurring boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'not_going')),
  updated_at timestamptz default now(),
  unique(event_id, user_id)
);

create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.event_series enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_comments enable row level security;

create policy "profiles readable by signed in users"
on public.profiles for select
using (auth.role() = 'authenticated');

create policy "profiles editable by owner"
on public.profiles for update
using (auth.uid() = id);

create policy "profiles insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "series readable by signed in users"
on public.event_series for select
using (auth.role() = 'authenticated');

create policy "series creatable by signed in users"
on public.event_series for insert
with check (auth.role() = 'authenticated');

create policy "events readable by signed in users"
on public.events for select
using (auth.role() = 'authenticated');

create policy "events creatable by signed in users"
on public.events for insert
with check (auth.role() = 'authenticated');

create policy "events editable by organizer or admin"
on public.events for update
using (auth.uid() = organizer_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "event_rsvps readable by signed in users"
on public.event_rsvps for select
using (auth.role() = 'authenticated');

create policy "event_rsvps upsertable by owner"
on public.event_rsvps for insert
with check (auth.uid() = user_id);

create policy "event_rsvps editable by owner"
on public.event_rsvps for update
using (auth.uid() = user_id);

create policy "comments readable by signed in users"
on public.event_comments for select
using (auth.role() = 'authenticated');

create policy "comments creatable by signed in users"
on public.event_comments for insert
with check (auth.uid() = user_id);
