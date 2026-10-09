-- 15. Run after 01–14.
-- Entertainment keeps only Microdramas and Films.
-- Everything else (Series, Short Films, Music Videos, Trailers, Promos, unknowns) → Films.

-- Move retired entertainment categories into Films.
update public.media_items
set category_slug = 'films'
where section = 'entertainment'
  and coalesce(nullif(btrim(category_slug), ''), '') <> 'microdramas'
  and coalesce(nullif(btrim(category_slug), ''), '') <> 'films';

-- Legacy rows that still hold the topic in subcategory_slug.
update public.media_items
set category_slug = 'films',
    subcategory_slug = ''
where section = 'entertainment'
  and (
    category_slug is null
    or btrim(category_slug) = ''
    or category_slug = 'entertainment'
  )
  and subcategory_slug is not null
  and length(btrim(subcategory_slug)) > 0
  and btrim(subcategory_slug) <> 'microdramas';

update public.media_items
set category_slug = 'microdramas',
    subcategory_slug = ''
where section = 'entertainment'
  and (
    category_slug is null
    or btrim(category_slug) = ''
    or category_slug = 'entertainment'
  )
  and subcategory_slug is not null
  and btrim(subcategory_slug) = 'microdramas';

-- Empty / unknown entertainment rows → Films.
update public.media_items
set category_slug = 'films'
where section = 'entertainment'
  and (
    category_slug is null
    or btrim(category_slug) = ''
    or category_slug = 'entertainment'
  );

-- Optional: only if you already ran 12_page_heroes.sql.
do $$
begin
  if to_regclass('public.page_heroes') is null then
    return;
  end if;

  update public.page_heroes
  set page_key = 'entertainment:films'
  where page_key like 'entertainment:%'
    and page_key <> 'entertainment'
    and page_key <> 'entertainment:microdramas'
    and page_key <> 'entertainment:films'
    and not exists (
      select 1 from public.page_heroes h2 where h2.page_key = 'entertainment:films'
    );

  delete from public.page_heroes
  where page_key like 'entertainment:%'
    and page_key <> 'entertainment'
    and page_key <> 'entertainment:microdramas'
    and page_key <> 'entertainment:films';
end $$;
