-- 3 of 4. Run after 02_functions.sql.

drop policy if exists "read own admin row" on public.admin_users;
create policy "read own admin row"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "public reads published media" on public.media_items;
create policy "public reads published media"
  on public.media_items
  for select
  using (published = true or public.is_admin());

drop policy if exists "admins insert media" on public.media_items;
create policy "admins insert media"
  on public.media_items
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins update media" on public.media_items;
create policy "admins update media"
  on public.media_items
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete media" on public.media_items;
create policy "admins delete media"
  on public.media_items
  for delete
  to authenticated
  using (public.is_admin());

grant select on public.media_items to anon, authenticated;
grant insert, update, delete on public.media_items to authenticated;
grant select on public.admin_users to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.claim_admin() to authenticated;
grant execute on function public.grant_admin(text) to authenticated;
