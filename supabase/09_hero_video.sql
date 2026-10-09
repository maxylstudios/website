-- 9. Run after 01–08.
-- A homepage hero video, kept apart from the catalogue.
-- One row. The file lives in storage; this table only keeps its path.

create table if not exists public.hero_video (
  id integer primary key default 1 check (id = 1),
  storage_path text not null,
  updated_at timestamptz not null default now()
);

alter table public.hero_video enable row level security;

drop policy if exists "public reads hero video" on public.hero_video;
create policy "public reads hero video"
  on public.hero_video
  for select
  to anon, authenticated
  using (true);

grant select on public.hero_video to anon, authenticated;

create or replace function public.save_hero_video(raw_token text, item_path text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  previous text;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_path is null or length(btrim(item_path)) = 0 then
    raise exception 'Choose a video';
  end if;

  select hero_video.storage_path into previous
  from public.hero_video
  where hero_video.id = 1;

  insert into public.hero_video (id, storage_path, updated_at)
  values (1, btrim(item_path), now())
  on conflict (id) do update
  set
    storage_path = excluded.storage_path,
    updated_at = now();

  return previous;
end;
$$;

create or replace function public.clear_hero_video(raw_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  previous text;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  select hero_video.storage_path into previous
  from public.hero_video
  where hero_video.id = 1;

  delete from public.hero_video where hero_video.id = 1;
  return previous;
end;
$$;

grant execute on function public.save_hero_video(text, text) to anon, authenticated;
grant execute on function public.clear_hero_video(text) to anon, authenticated;
