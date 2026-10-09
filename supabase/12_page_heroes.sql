-- 12. Run after 01–11.
-- Which catalogue video leads each Ads and Entertainment page.

create table if not exists public.page_heroes (
  page_key text primary key,
  media_id uuid not null references public.media_items(id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.page_heroes enable row level security;

drop policy if exists "public reads page heroes" on public.page_heroes;
create policy "public reads page heroes"
  on public.page_heroes
  for select
  to anon, authenticated
  using (true);

grant select on public.page_heroes to anon, authenticated;

create or replace function public.save_page_heroes(raw_token text, heroes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  entry record;
  picked uuid;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if heroes is null or jsonb_typeof(heroes) <> 'object' then
    raise exception 'Choose the pages';
  end if;

  for entry in select key, value from jsonb_each(heroes)
  loop
    if entry.key !~ '^[a-z0-9:-]{1,80}$' then
      raise exception 'Unknown page';
    end if;

    delete from public.page_heroes where page_key = entry.key;

    if jsonb_typeof(entry.value) = 'string' and length(entry.value #>> '{}') > 0 then
      begin
        picked := (entry.value #>> '{}')::uuid;
      exception
        when others then
          raise exception 'Choose a video';
      end;

      if not exists (
        select 1 from public.media_items
        where id = picked and kind = 'video'
      ) then
        raise exception 'Choose a video';
      end if;

      insert into public.page_heroes (page_key, media_id, updated_at)
      values (entry.key, picked, now());
    end if;
  end loop;
end;
$$;

grant execute on function public.save_page_heroes(text, jsonb) to anon, authenticated;
