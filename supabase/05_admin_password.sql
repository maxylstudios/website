-- 5 of 5. Run after 01–04.
-- Replaces email admin accounts with one shared password.
-- Password: MaxylDesk9421
-- Change that string below before you run this if you want a different one.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_config (
  id integer primary key default 1 check (id = 1),
  password_hash text not null
);

insert into public.admin_config (id, password_hash)
values (1, extensions.crypt('MaxylDesk9421', extensions.gen_salt('bf')))
on conflict (id) do update
set password_hash = excluded.password_hash;

create table if not exists public.admin_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);

create table if not exists public.upload_tickets (
  object_name text primary key,
  expires_at timestamptz not null
);

alter table public.admin_config enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.upload_tickets enable row level security;

create or replace function public.admin_session_valid(raw_token text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select raw_token is not null and exists (
    select 1
    from public.admin_sessions
    where token_hash = pg_catalog.encode(extensions.digest(raw_token, 'sha256'), 'hex')
      and expires_at > now()
  );
$$;

create or replace function public.open_admin_session(candidate text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw_token text;
begin
  if not exists (
    select 1
    from public.admin_config
    where id = 1
      and password_hash = extensions.crypt(candidate, password_hash)
  ) then
    raise exception 'Wrong password';
  end if;

  delete from public.admin_sessions where expires_at < now();

  raw_token := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.admin_sessions (token_hash, expires_at)
  values (
    pg_catalog.encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    now() + interval '14 days'
  );
  return raw_token;
end;
$$;

create or replace function public.close_admin_session(raw_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.admin_sessions
  where token_hash = pg_catalog.encode(extensions.digest(raw_token, 'sha256'), 'hex');
end;
$$;

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
  order by created_at desc;
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
  item_published boolean
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

  if item_id is null then
    insert into public.media_items (
      title, label, caption, kind, storage_path, aspect, crop, width, height, published
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
      coalesce(item_published, true)
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

  if previous is not null then
    delete from storage.objects
    where bucket_id = 'media' and name = previous;
  end if;
end;
$$;

drop policy if exists "admins insert media" on public.media_items;
drop policy if exists "admins update media" on public.media_items;
drop policy if exists "admins delete media" on public.media_items;

drop policy if exists "admins insert media objects" on storage.objects;
drop policy if exists "admins update media objects" on storage.objects;
drop policy if exists "admins delete media objects" on storage.objects;

drop policy if exists "ticketed media upload" on storage.objects;
create policy "ticketed media upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'media' and public.upload_ticket_valid(name));

revoke all on function public.claim_admin() from public, anon, authenticated;
revoke all on function public.grant_admin(text) from public, anon, authenticated;

grant execute on function public.open_admin_session(text) to anon, authenticated;
grant execute on function public.close_admin_session(text) to anon, authenticated;
grant execute on function public.begin_media_upload(text, text) to anon, authenticated;
grant execute on function public.list_admin_media(text) to anon, authenticated;
grant execute on function public.save_media_item(text, uuid, text, text, text, text, text, text, jsonb, integer, integer, boolean) to anon, authenticated;
grant execute on function public.delete_media_item(text, uuid) to anon, authenticated;
grant execute on function public.upload_ticket_valid(text) to anon, authenticated;
