-- 17. Run after 16.
-- Optional Ads meta on media_items: client, role, style_tag + save RPC for the seed/admin desk.

alter table public.media_items
  add column if not exists client text not null default '',
  add column if not exists role text not null default '',
  add column if not exists style_tag text not null default '';

create or replace function public.save_item_ads_meta(
  raw_token text,
  item_id uuid,
  item_title text,
  item_caption text,
  item_client text,
  item_role text,
  item_style text
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
    client = coalesce(item_client, ''),
    role = coalesce(item_role, ''),
    style_tag = coalesce(item_style, ''),
    updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;
end;
$$;

grant execute on function public.save_item_ads_meta(text, uuid, text, text, text, text, text) to anon, authenticated;
