-- 19. Run after 18.
-- Entertainment desk: save title, caption, client, role, look, and partner link together.

alter table public.media_items
  add column if not exists client text not null default '',
  add column if not exists role text not null default '',
  add column if not exists style_tag text not null default '',
  add column if not exists external_url text not null default '';

create or replace function public.save_item_entertainment(
  raw_token text,
  item_id uuid,
  item_title text,
  item_caption text,
  item_client text,
  item_role text,
  item_style text,
  item_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_title is null or length(btrim(item_title)) = 0 then
    raise exception 'Add a title';
  end if;

  cleaned := btrim(coalesce(item_url, ''));
  if cleaned <> '' and cleaned !~* '^https?://' then
    raise exception 'External link must start with http:// or https://';
  end if;

  update public.media_items
  set
    title = btrim(item_title),
    caption = coalesce(item_caption, ''),
    client = coalesce(item_client, ''),
    role = coalesce(item_role, ''),
    style_tag = coalesce(item_style, ''),
    external_url = cleaned,
    updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;
end;
$$;

grant execute on function public.save_item_entertainment(text, uuid, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
