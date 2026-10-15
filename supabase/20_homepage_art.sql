-- 20. Run after 01–19.
-- Images for the homepage feature blocks: the YAILIANS poster, the era still, and the three craft cards.
-- Copy stays in the site. This table only stores the pictures.

create table if not exists public.homepage_art (
  slot text primary key,
  image_path text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.homepage_art enable row level security;

drop policy if exists "public reads homepage art" on public.homepage_art;
create policy "public reads homepage art"
  on public.homepage_art
  for select
  to anon, authenticated
  using (true);

grant select on public.homepage_art to anon, authenticated;

create or replace function public.save_homepage_art(raw_token text, art_slot text, item_path text)
returns text
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  previous text;
  clean_slot text := lower(btrim(coalesce(art_slot, '')));
  clean_path text := btrim(coalesce(item_path, ''));
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if clean_slot not in ('yailians', 'era', 'card-worlds', 'card-faces', 'card-campaigns') then
    raise exception 'Unknown homepage image';
  end if;

  if length(clean_path) = 0 then
    raise exception 'Choose an image';
  end if;

  select image_path into previous
  from public.homepage_art
  where slot = clean_slot;

  insert into public.homepage_art (slot, image_path, updated_at)
  values (clean_slot, clean_path, now())
  on conflict (slot) do update
    set image_path = excluded.image_path,
        updated_at = now();

  delete from public.upload_tickets where upload_tickets.object_name = clean_path;

  if previous is not null and previous <> clean_path and previous !~* '^https?://' then
    perform set_config('storage.allow_delete_query', 'true', true);
    delete from storage.objects
    where bucket_id = 'media' and name = previous;
  end if;

  return previous;
end;
$$;

grant execute on function public.save_homepage_art(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
