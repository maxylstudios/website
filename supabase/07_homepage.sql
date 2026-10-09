-- 7. Run after 01–06.
-- Adds a Show on homepage flag. Leave it off until you want that film on the landing page.

alter table public.media_items
  add column if not exists show_on_home boolean not null default false;

drop function if exists public.save_media_item(text, uuid, text, text, text, text, text, text, jsonb, integer, integer, boolean, text, text, text);

create or replace function public.save_media_item(
  raw_token text,
  item_id uuid,
  item_title text,
  item_label text,
  item_caption text,
  item_kind text,
  item_path text,
  item_aspect text,
  item_crop jsonb,
  item_width integer,
  item_height integer,
  item_published boolean,
  item_section text,
  item_category text,
  item_subcategory text,
  item_show_on_home boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  saved uuid;
  previous text;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_title is null or length(btrim(item_title)) = 0 then
    raise exception 'Add a title';
  end if;

  if item_section is null or item_section not in ('ads', 'entertainment') then
    raise exception 'Choose Ads or Entertainment';
  end if;

  if item_category is null or length(btrim(item_category)) = 0 then
    raise exception 'Choose a category';
  end if;

  if item_subcategory is null or length(btrim(item_subcategory)) = 0 then
    raise exception 'Choose a subcategory';
  end if;

  if item_id is null then
    insert into public.media_items (
      title, label, caption, kind, storage_path, aspect, crop, width, height, published,
      section, category_slug, subcategory_slug, show_on_home
    )
    values (
      btrim(item_title),
      btrim(coalesce(item_label, '')),
      coalesce(item_caption, ''),
      item_kind,
      item_path,
      item_aspect,
      item_crop,
      item_width,
      item_height,
      coalesce(item_published, true),
      item_section,
      item_category,
      item_subcategory,
      coalesce(item_show_on_home, false)
    )
    returning id into saved;
  else
    select storage_path into previous from public.media_items where id = item_id;

    update public.media_items
    set
      title = btrim(item_title),
      label = btrim(coalesce(item_label, '')),
      caption = coalesce(item_caption, ''),
      kind = item_kind,
      storage_path = item_path,
      aspect = item_aspect,
      crop = item_crop,
      width = item_width,
      height = item_height,
      published = coalesce(item_published, true),
      section = item_section,
      category_slug = item_category,
      subcategory_slug = item_subcategory,
      show_on_home = coalesce(item_show_on_home, false),
      updated_at = now()
    where id = item_id
    returning id into saved;

    if previous is not null and previous <> item_path then
      delete from storage.objects
      where bucket_id = 'media' and name = previous;
    end if;
  end if;

  if saved is null then
    raise exception 'Upload was not found';
  end if;

  delete from public.upload_tickets where upload_tickets.object_name = item_path;
  return saved;
end;
$$;

grant execute on function public.save_media_item(text, uuid, text, text, text, text, text, text, jsonb, integer, integer, boolean, text, text, text, boolean) to anon, authenticated;
