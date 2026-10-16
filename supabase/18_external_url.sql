-- 18. Run after 17.
-- Optional external / partner link on each title (e.g. Kuku TV for microdramas).

alter table public.media_items
  add column if not exists external_url text not null default '';

create or replace function public.save_item_external_url(
  raw_token text,
  item_id uuid,
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

  cleaned := btrim(coalesce(item_url, ''));

  if cleaned <> '' and cleaned !~* '^https?://' then
    raise exception 'External link must start with http:// or https://';
  end if;

  update public.media_items
  set
    external_url = cleaned,
    updated_at = now()
  where id = item_id;

  if not found then
    raise exception 'Upload was not found';
  end if;
end;
$$;

grant execute on function public.save_item_external_url(text, uuid, text) to anon, authenticated;
