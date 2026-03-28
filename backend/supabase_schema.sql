-- UrbanPulse Manila -- Supabase schema for the reports table.
-- Run this in the Supabase SQL Editor to bootstrap the database.

create table reports (
  id text primary key,
  category text not null,
  subcategories text[] default '{}',
  severity text not null default 'moderate',
  location_text text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text default '',
  image_url text,
  report_time timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reports enable row level security;
create policy "Anyone can read reports" on reports for select using (true);
create policy "Anyone can insert reports" on reports for insert with check (true);
