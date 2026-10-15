-- 16. Run after 01–15.
-- Quick title + caption edits for the Ads admin desk (no full re-save of the film).

create or replace function public.save_item_copy(
  raw_token text,
  item_id uuid,
  item_title text,
  item_caption text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_title is null or length(btrim(item_title)) = 0 then
    raise exception 'Add a title';
  end if;

  update public.media_items
  set
    title = btrim(item_title),
    caption = coalesce(item_caption, ''),
    updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;
end;
$$;

grant execute on function public.save_item_copy(text, uuid, text, text) to anon, authenticated;
