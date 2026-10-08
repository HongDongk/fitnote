create schema if not exists private;

create function private.link_member_account(instructor_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  verified_email text;
  member_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select lower(btrim(users.email)) into verified_email
  from auth.users as users
  where users.id = current_user_id
    and users.email_confirmed_at is not null
    and users.email is not null;

  if verified_email is null then
    raise exception 'Verified email required' using errcode = '42501';
  end if;

  update public.members as members
  set auth_user_id = current_user_id
  from public.profiles as profiles
  where profiles.slug = instructor_slug
    and members.instructor_id = profiles.id
    and members.email = verified_email
    and (members.auth_user_id is null or members.auth_user_id = current_user_id)
  returning members.id into member_id;

  return member_id;
exception
  when unique_violation then return null;
end;
$$;

revoke all on function private.link_member_account(text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.link_member_account(text) to authenticated;

create function public.link_member_account(instructor_slug text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.link_member_account(instructor_slug);
$$;

revoke all on function public.link_member_account(text) from public, anon, authenticated;
grant execute on function public.link_member_account(text) to authenticated;

comment on function public.link_member_account(text) is
  'Links the authenticated, email-confirmed account to its instructor membership; returns NULL when unavailable.';
