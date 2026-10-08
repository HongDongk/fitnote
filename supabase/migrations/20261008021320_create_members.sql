create table public.members (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  auth_user_id uuid references auth.users (id) on delete set null,
  name text not null check (
    name = btrim(name) and char_length(name) between 1 and 50
  ),
  email text not null check (
    email = lower(btrim(email))
    and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_instructor_email_key unique (instructor_id, email)
);

create unique index members_instructor_auth_user_key
on public.members (instructor_id, auth_user_id)
where auth_user_id is not null;

create index members_auth_user_id_idx
on public.members (auth_user_id)
where auth_user_id is not null;

alter table public.members enable row level security;

revoke all on public.members from public, anon, authenticated;
grant select, delete on public.members to authenticated;
grant insert (instructor_id, name, email) on public.members to authenticated;
grant update (name, email) on public.members to authenticated;
-- Account linking is reserved for a future trusted, verified-email flow.
grant all on public.members to service_role;

create policy "Instructors can read their own members"
on public.members for select to authenticated
using ((select auth.uid()) = instructor_id);

create policy "Members can read their linked membership"
on public.members for select to authenticated
using ((select auth.uid()) = auth_user_id);

create policy "Instructors can register their own members"
on public.members for insert to authenticated
with check ((select auth.uid()) = instructor_id);

create policy "Instructors can update their own members"
on public.members for update to authenticated
using ((select auth.uid()) = instructor_id)
with check ((select auth.uid()) = instructor_id);

create policy "Instructors can delete their own members"
on public.members for delete to authenticated
using ((select auth.uid()) = instructor_id);

create function public.protect_member_writes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if old.auth_user_id is not null and new.email is distinct from old.email then
      raise exception 'members_linked_email_immutable: Linked member email cannot be changed'
        using errcode = '23514', constraint = 'members_linked_email_immutable';
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.protect_member_writes() from public, anon, authenticated;

create trigger protect_member_writes
before update on public.members
for each row execute function public.protect_member_writes();

comment on table public.members is 'Instructor-managed members; account linking follows verified email authentication.';
comment on column public.members.auth_user_id is 'NULL until verified account linking; never writable from the browser.';
