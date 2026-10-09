-- 13. Run after 01–12.
-- A poster image for each film. Any shape. The homepage shelves use it.

alter table public.media_items
  add column if not exists poster_path text;

create or replace function public.save_item_poster(raw_token text, item_id uuid, item_path text)
returns text
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  previous text;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_path is null or length(btrim(item_path)) = 0 then
    raise exception 'Choose a poster';
  end if;

  select poster_path into previous
  from public.media_items
  where id = item_id;

  update public.media_items
  set poster_path = btrim(item_path), updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;

  delete from public.upload_tickets where upload_tickets.object_name = btrim(item_path);

  if previous is not null and previous <> btrim(item_path) and previous !~* '^https?://' then
    perform set_config('storage.allow_delete_query', 'true', true);
    delete from storage.objects
    where bucket_id = 'media' and name = previous;
  end if;

  return previous;
end;
$$;

grant execute on function public.save_item_poster(text, uuid, text) to anon, authenticated;
