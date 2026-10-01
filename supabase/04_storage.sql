-- 4 of 4. Run last, after 03_policies.sql.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read media objects" on storage.objects;
create policy "public read media objects"
  on storage.objects
  for select
  using (bucket_id = 'media');

drop policy if exists "admins insert media objects" on storage.objects;
create policy "admins insert media objects"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins update media objects" on storage.objects;
create policy "admins update media objects"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins delete media objects" on storage.objects;
create policy "admins delete media objects"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
