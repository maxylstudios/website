-- 8. Run after 01–07.
-- Fixes ambiguous object_name in upload ticket helpers.

drop policy if exists "ticketed media upload" on storage.objects;
drop function if exists public.upload_ticket_valid(text);
drop function if exists public.begin_media_upload(text, text);

create or replace function public.upload_ticket_valid(ticket_path text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.upload_tickets
    where upload_tickets.object_name = ticket_path
      and upload_tickets.expires_at > now()
  );
$$;

create or replace function public.begin_media_upload(raw_token text, ticket_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  insert into public.upload_tickets as tickets (object_name, expires_at)
  values (ticket_path, now() + interval '15 minutes')
  on conflict (object_name) do update
  set expires_at = excluded.expires_at;
end;
$$;

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
    select media_items.storage_path into previous
    from public.media_items
    where media_items.id = item_id;

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
    where media_items.id = item_id
    returning media_items.id into saved;

    if previous is not null and previous <> item_path then
      delete from storage.objects
      where storage.objects.bucket_id = 'media'
        and storage.objects.name = previous;
    end if;
  end if;

  if saved is null then
    raise exception 'Upload was not found';
  end if;

  delete from public.upload_tickets
  where upload_tickets.object_name = item_path;

  return saved;
end;
$$;

grant execute on function public.upload_ticket_valid(text) to anon, authenticated;
grant execute on function public.begin_media_upload(text, text) to anon, authenticated;
grant execute on function public.save_media_item(text, uuid, text, text, text, text, text, text, jsonb, integer, integer, boolean, text, text, text, boolean) to anon, authenticated;

create policy "ticketed media upload"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'media' and public.upload_ticket_valid(name));
