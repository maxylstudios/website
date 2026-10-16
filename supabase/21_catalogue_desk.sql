-- 21. Run after 01–20.
-- Catalogue order, optional partner on microdramas, and hide/delete Ads categories.

alter table public.media_items
  add column if not exists sort_order integer not null default 0,
  add column if not exists show_partner boolean not null default true;

create table if not exists public.hidden_categories (
  section text not null,
  slug text not null,
  updated_at timestamptz not null default now(),
  primary key (section, slug)
);

alter table public.hidden_categories enable row level security;

drop policy if exists "public reads hidden categories" on public.hidden_categories;
create policy "public reads hidden categories"
  on public.hidden_categories
  for select
  to anon, authenticated
  using (true);

grant select on public.hidden_categories to anon, authenticated;

create or replace function public.list_admin_media(raw_token text)
returns setof public.media_items
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  return query
  select *
  from public.media_items
  order by sort_order asc, created_at desc;
end;
$$;

create or replace function public.save_catalogue_order(raw_token text, item_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if item_ids is null then
    raise exception 'Choose the order';
  end if;

  for i in 1 .. coalesce(array_length(item_ids, 1), 0) loop
    update public.media_items
    set sort_order = i, updated_at = now()
    where id = item_ids[i];
  end loop;
end;
$$;

grant execute on function public.save_catalogue_order(text, uuid[]) to anon, authenticated;

create or replace function public.hide_catalogue_category(raw_token text, cat_section text, cat_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_section text := lower(btrim(coalesce(cat_section, '')));
  clean_slug text := lower(btrim(coalesce(cat_slug, '')));
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  if clean_section not in ('ads', 'entertainment') then
    raise exception 'Unknown section';
  end if;

  if clean_slug !~ '^[a-z0-9-]{1,80}$' then
    raise exception 'Unknown category';
  end if;

  insert into public.hidden_categories (section, slug, updated_at)
  values (clean_section, clean_slug, now())
  on conflict (section, slug) do update
    set updated_at = now();
end;
$$;

grant execute on function public.hide_catalogue_category(text, text, text) to anon, authenticated;

create or replace function public.restore_catalogue_category(raw_token text, cat_section text, cat_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_section text := lower(btrim(coalesce(cat_section, '')));
  clean_slug text := lower(btrim(coalesce(cat_slug, '')));
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  delete from public.hidden_categories
  where section = clean_section and slug = clean_slug;
end;
$$;

grant execute on function public.restore_catalogue_category(text, text, text) to anon, authenticated;

drop function if exists public.save_item_entertainment(text, uuid, text, text, text, text, text, text);

create or replace function public.save_item_entertainment(
  raw_token text,
  item_id uuid,
  item_title text,
  item_caption text,
  item_client text,
  item_role text,
  item_style text,
  item_url text,
  item_show_partner boolean default true
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
    show_partner = coalesce(item_show_partner, true),
    updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;
end;
$$;

grant execute on function public.save_item_entertainment(text, uuid, text, text, text, text, text, text, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
