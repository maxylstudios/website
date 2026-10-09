-- 11. Run after 01–10.
-- The homepage under the hero: an ordered video masonry, then an ordered image masonry.

create table if not exists public.homepage_board (
  id integer primary key default 1 check (id = 1),
  video_ids uuid[] not null default '{}',
  image_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.homepage_board enable row level security;

drop policy if exists "public reads homepage board" on public.homepage_board;
create policy "public reads homepage board"
  on public.homepage_board
  for select
  to anon, authenticated
  using (true);

grant select on public.homepage_board to anon, authenticated;

create or replace function public.save_homepage_board(
  raw_token text,
  next_videos uuid[],
  next_images uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  videos uuid[];
  images uuid[];
begin
  if not public.admin_session_valid(raw_token) then
    raise exception 'Not allowed';
  end if;

  select coalesce(array_agg(picked.id order by picked.ord), '{}')
  into videos
  from (
    select items.id, min(entered.ord) as ord
    from unnest(coalesce(next_videos, '{}')) with ordinality as entered(id, ord)
    join public.media_items as items on items.id = entered.id and items.kind = 'video'
    group by items.id
  ) as picked;

  select coalesce(array_agg(picked.id order by picked.ord), '{}')
  into images
  from (
    select items.id, min(entered.ord) as ord
    from unnest(coalesce(next_images, '{}')) with ordinality as entered(id, ord)
    join public.media_items as items on items.id = entered.id and items.kind = 'image'
    group by items.id
  ) as picked;

  insert into public.homepage_board (id, video_ids, image_ids, updated_at)
  values (1, videos, images, now())
  on conflict (id) do update
  set
    video_ids = excluded.video_ids,
    image_ids = excluded.image_ids,
    updated_at = now();

  update public.media_items
  set show_on_home = true
  where id = any(videos) or id = any(images);

  update public.media_items
  set show_on_home = false
  where not (id = any(videos) or id = any(images));
end;
$$;

grant execute on function public.save_homepage_board(text, uuid[], uuid[]) to anon, authenticated;
