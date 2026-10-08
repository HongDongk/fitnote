-- Run against a migrated local/test database only. Fixtures are rolled back.
begin;

insert into auth.users (id, email, email_confirmed_at) values
  ('41111111-1111-4111-8111-111111111111', 'teacher@example.com', now()),
  ('42222222-2222-4222-8222-222222222222', 'Member@example.com', now()),
  ('43333333-3333-4333-8333-333333333333', 'unconfirmed@example.com', null),
  ('44444444-4444-4444-8444-444444444444', 'stranger@example.com', now()),
  ('45555555-5555-4555-8555-555555555555', 'owner@example.com', now());

insert into public.profiles (id, display_name, slug) values
  ('41111111-1111-4111-8111-111111111111', '테스트 강사', 'link-test-teacher');

insert into public.members (instructor_id, name, email, auth_user_id) values
  ('41111111-1111-4111-8111-111111111111', '연결 회원', 'member@example.com', null),
  ('41111111-1111-4111-8111-111111111111', '미인증 회원', 'unconfirmed@example.com', null),
  ('41111111-1111-4111-8111-111111111111', '기존 연결', 'stranger@example.com', '45555555-5555-4555-8555-555555555555');

select set_config('request.jwt.claim.sub', '42222222-2222-4222-8222-222222222222', true);
set local role authenticated;
do $$
declare linked_id uuid;
begin
  linked_id := public.link_member_account('link-test-teacher');
  if linked_id is null then raise exception 'Verified membership did not link'; end if;
  if public.link_member_account('link-test-teacher') is distinct from linked_id then
    raise exception 'Repeated linking was not idempotent';
  end if;
  if not exists (select 1 from public.members where id = linked_id and auth_user_id = auth.uid()) then
    raise exception 'Linked membership not readable';
  end if;
  if public.link_member_account('nonexistent-teacher') is not null then
    raise exception 'Unknown instructor disclosed membership';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '43333333-3333-4333-8333-333333333333', true);
do $$ begin
  begin
    perform public.link_member_account('link-test-teacher');
    raise exception 'Unconfirmed email linked';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
-- A forged claim is ignored: identity comes only from auth.users.
select set_config('request.jwt.claim.email', 'member@example.com', true);
do $$ begin
  if public.link_member_account('link-test-teacher') is not null then
    raise exception 'Another account membership was claimed';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '45555555-5555-4555-8555-555555555555', true);
do $$ begin
  if public.link_member_account('link-test-teacher') is not null then
    raise exception 'Unregistered email linked another member';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.link_member_account('link-test-teacher');
    raise exception 'Missing auth identity allowed';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role anon;
do $$ begin
  begin
    perform public.link_member_account('link-test-teacher');
    raise exception 'Anonymous RPC allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- A second matching row cannot duplicate an existing account connection.
insert into public.members (instructor_id, name, email) values
  ('41111111-1111-4111-8111-111111111111', '중복 연결 대상', 'owner@example.com');
select set_config('request.jwt.claim.sub', '45555555-5555-4555-8555-555555555555', true);
set local role authenticated;
do $$ begin
  if public.link_member_account('link-test-teacher') is not null then
    raise exception 'Duplicate account connection allowed';
  end if;
end $$;
reset role;

do $$ begin
  if has_function_privilege('anon', 'private.link_member_account(text)', 'EXECUTE') then
    raise exception 'Private linking exposed to anonymous users';
  end if;
  if exists (select 1 from public.members where email = 'unconfirmed@example.com' and auth_user_id is not null) then
    raise exception 'Unconfirmed member was mutated';
  end if;
  if exists (select 1 from public.members where email = 'owner@example.com' and auth_user_id is not null) then
    raise exception 'Failed duplicate connection mutated the row';
  end if;
  if (select auth_user_id from public.members where email = 'stranger@example.com')
    is distinct from '45555555-5555-4555-8555-555555555555'::uuid then
    raise exception 'Previously bound account was replaced';
  end if;
end $$;

rollback;
