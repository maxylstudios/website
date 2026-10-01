-- 2 of 4. Run after 01_tables.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.claim_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;

  lock table public.admin_users in exclusive mode;

  if exists (select 1 from public.admin_users) then
    raise exception 'An admin already exists';
  end if;

  insert into public.admin_users (user_id) values (auth.uid());
end;
$$;

create or replace function public.grant_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target uuid;
begin
  if not public.is_admin() then
    raise exception 'Not an admin';
  end if;

  select id into target from auth.users where lower(email) = lower(target_email);
  if target is null then
    raise exception 'No account with that email. They need to sign up first.';
  end if;

  insert into public.admin_users (user_id) values (target)
  on conflict (user_id) do nothing;
end;
$$;
