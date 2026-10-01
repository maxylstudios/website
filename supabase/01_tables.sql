-- 1 of 4. Run this first.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  label text not null default '',
  caption text not null default '',
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  aspect text not null default '16:9',
  crop jsonb,
  width integer,
  height integer,
  published boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.media_items enable row level security;
