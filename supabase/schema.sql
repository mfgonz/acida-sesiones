-- ACIDA Sesiones: scheduling app schema
-- Single-admin app. RLS is enabled on every table with NO policies attached,
-- so only the Supabase service_role key (used exclusively in server-side
-- route handlers, never shipped to the browser) can read/write. Supabase
-- Auth is used only to gate the admin dashboard UI, not for row access.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text not null default '',
  timezone text not null default 'America/Mexico_City',
  google_email text,
  google_refresh_token text,
  google_connected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists availability_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null default 'Working hours',
  timezone text not null default 'America/Mexico_City',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- day_of_week: 0 = Sunday .. 6 = Saturday
create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references availability_schedules (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

-- One-off exceptions: fully unavailable day, or custom hours for a specific date
create table if not exists date_overrides (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references availability_schedules (id) on delete cascade,
  date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  unique (schedule_id, date)
);

create table if not exists event_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  schedule_id uuid references availability_schedules (id) on delete set null,
  slug text not null,
  name text not null,
  description text not null default '',
  duration_minutes int not null default 30,
  location_type text not null default 'google_meet' check (location_type in ('google_meet', 'in_person', 'phone', 'custom')),
  location_details text not null default '',
  color text not null default '#4f6bff',
  is_active boolean not null default false,
  buffer_before_minutes int not null default 0,
  buffer_after_minutes int not null default 0,
  min_notice_minutes int not null default 60,
  booking_horizon_days int not null default 60,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references event_types (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  invitee_name text not null,
  invitee_email text not null,
  invitee_notes text not null default '',
  invitee_timezone text not null default 'UTC',
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'canceled')),
  google_event_id text,
  meet_link text,
  cancel_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_start_idx on bookings (user_id, start_time);
create index if not exists event_types_user_idx on event_types (user_id);
create index if not exists availability_rules_schedule_idx on availability_rules (schedule_id);

alter table profiles enable row level security;
alter table availability_schedules enable row level security;
alter table availability_rules enable row level security;
alter table date_overrides enable row level security;
alter table event_types enable row level security;
alter table bookings enable row level security;

-- No policies are created intentionally: all application access goes through
-- server-side route handlers using the service_role key, which bypasses RLS.
