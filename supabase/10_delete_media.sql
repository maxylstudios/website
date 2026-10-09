-- 10. Run after 01–09.
-- Supabase blocks DELETE on storage.objects unless the storage flag is set.
-- That was rolling back every delete, including videos that live in S3.

create or replace function public.delete_media_item(raw_token text, item_id uuid)
returns void
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

  select storage_path into previous from public.media_items where id = item_id;
  delete from public.media_items where id = item_id;

  -- S3 videos are removed by the app. Only catalogue files in the media bucket
  -- are rows in storage.objects, and those need the storage delete flag.
  if previous is not null and previous !~* '^https?://' then
    perform set_config('storage.allow_delete_query', 'true', true);
    delete from storage.objects
    where bucket_id = 'media' and name = previous;
  end if;
end;
$$;

grant execute on function public.delete_media_item(text, uuid) to anon, authenticated;
