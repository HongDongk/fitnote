-- Run against a migrated local/test database only. Fixtures are rolled back.
begin;

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('33333333-3333-4333-8333-333333333333');

insert into public.profiles (id, display_name, slug) values
  ('11111111-1111-4111-8111-111111111111', '강사 A', 'members-test-a'),
  ('22222222-2222-4222-8222-222222222222', '강사 B', 'members-test-b');

insert into public.members (instructor_id, name, email) values
  ('11111111-1111-4111-8111-111111111111', '회원 A', 'a@example.com'),
  ('22222222-2222-4222-8222-222222222222', '회원 B', 'b@example.com');

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
set local role authenticated;
do $$
declare affected integer;
begin
  if (select count(*) from public.members) <> 1 then
    raise exception 'Instructor can see another instructor members';
  end if;
  insert into public.members (instructor_id, name, email)
  values (auth.uid(), '회원 C', 'c@example.com');
  update public.members set name = '회원 A 수정' where email = 'a@example.com';
  if not exists (select 1 from public.members where name = '회원 A 수정' and updated_at = now()) then
    raise exception 'Own update or timestamp failed';
  end if;
  begin
    insert into public.members (instructor_id, name, email)
    values ('22222222-2222-4222-8222-222222222222', '위조', 'fake@example.com');
    raise exception 'Foreign registration allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.members set auth_user_id = auth.uid();
    raise exception 'Browser account linking allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.members set instructor_id = '22222222-2222-4222-8222-222222222222';
    raise exception 'Instructor reassignment allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.members (instructor_id, name, email, auth_user_id)
    values (auth.uid(), '위조', 'fake@example.com', auth.uid());
    raise exception 'Browser can insert linked account';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.members (instructor_id, name, email)
    values (auth.uid(), '중복', 'a@example.com');
    raise exception 'Duplicate email allowed';
  exception when unique_violation then null; end;
  begin
    insert into public.members (instructor_id, name, email)
    values (auth.uid(), '빈 이메일', 'invalid');
    raise exception 'Invalid email allowed';
  exception when check_violation then null; end;
  update public.members set name = '위조' where email = 'b@example.com';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign update allowed'; end if;
  delete from public.members where email = 'b@example.com';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign deletion allowed'; end if;
  delete from public.members where email = 'c@example.com';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Own deletion failed'; end if;
end $$;

reset role;
set local role service_role;
update public.members set auth_user_id = '33333333-3333-4333-8333-333333333333'
where email = 'a@example.com';
do $$ begin
  begin
    insert into public.members (instructor_id, auth_user_id, name, email)
    values ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '중복 연결', 'duplicate@example.com');
    raise exception 'Duplicate account link allowed';
  exception when unique_violation then null; end;
  insert into public.members (instructor_id, name, email)
  values ('22222222-2222-4222-8222-222222222222', '다른 강사의 회원 A', 'a@example.com');
end $$;
reset role;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
set local role authenticated;
do $$
declare affected integer;
begin
  if (select count(*) from public.members) <> 1 then raise exception 'Linked read failed'; end if;
  update public.members set name = '회원 변경';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Member update allowed'; end if;
  delete from public.members;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Member deletion allowed'; end if;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  begin
    update public.members set email = 'changed@example.com' where email = 'a@example.com';
    raise exception 'Linked email change allowed';
  exception when check_violation then null; end;
end $$;

set local role anon;
do $$ begin
  begin perform * from public.members; raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null; end;
  begin update public.members set name = '비로그인'; raise exception 'Anonymous update allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.members (instructor_id, name, email)
    values ('11111111-1111-4111-8111-111111111111', '비로그인', 'anon@example.com');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null; end;
  begin delete from public.members; raise exception 'Anonymous deletion allowed';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
delete from public.profiles where id = '22222222-2222-4222-8222-222222222222';
do $$ begin
  if exists (select 1 from public.members where instructor_id = '22222222-2222-4222-8222-222222222222') then
    raise exception 'Instructor deletion did not cascade';
  end if;
end $$;

reset role;
delete from auth.users where id = '33333333-3333-4333-8333-333333333333';
do $$ begin
  if not exists (select 1 from public.members where email = 'a@example.com' and auth_user_id is null) then
    raise exception 'Auth deletion did not unlink member';
  end if;
end $$;

rollback;
select 'members permission and constraint tests passed (rolled back)' as result;
