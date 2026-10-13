-- Run against a migrated local/test database only. Fixtures are rolled back.
begin;

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

insert into public.profiles (id, display_name, slug) values
  ('11111111-1111-4111-8111-111111111111', '강사 A', 'schedules-test-a'),
  ('22222222-2222-4222-8222-222222222222', '강사 B', 'schedules-test-b');

insert into public.schedules (instructor_id, title, starts_at, ends_at) values
  ('11111111-1111-4111-8111-111111111111', '수업 A', '2026-10-14 09:00+09', '2026-10-14 10:00+09'),
  ('22222222-2222-4222-8222-222222222222', '수업 B', '2026-10-14 11:00+09', '2026-10-14 12:00+09');

set local role anon;
do $$ begin
  if (select count(*) from public.schedules) <> 2 then
    raise exception 'Anonymous visitors cannot read schedules';
  end if;
  begin
    insert into public.schedules (instructor_id, title, starts_at, ends_at)
    values ('11111111-1111-4111-8111-111111111111', '익명', '2026-10-15 09:00+09', '2026-10-15 10:00+09');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
set local role authenticated;
do $$
declare affected integer;
begin
  insert into public.schedules (instructor_id, title, starts_at, ends_at, color)
  values (auth.uid(), '수업 C', '2026-10-15 09:00+09', '2026-10-15 10:00+09', 'blue');
  update public.schedules set title = '수업 A 수정' where title = '수업 A';
  if not exists (select 1 from public.schedules where title = '수업 A 수정' and updated_at = now()) then
    raise exception 'Own update or timestamp failed';
  end if;
  begin
    insert into public.schedules (instructor_id, title, starts_at, ends_at)
    values ('22222222-2222-4222-8222-222222222222', '위조', '2026-10-15 09:00+09', '2026-10-15 10:00+09');
    raise exception 'Foreign insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.schedules set instructor_id = '22222222-2222-4222-8222-222222222222';
    raise exception 'Instructor reassignment allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.schedules (instructor_id, title, starts_at, ends_at)
    values (auth.uid(), '역순', '2026-10-15 10:00+09', '2026-10-15 09:00+09');
    raise exception 'Invalid time range allowed';
  exception when check_violation then null; end;
  begin
    insert into public.schedules (instructor_id, title, starts_at, ends_at, color)
    values (auth.uid(), '색상', '2026-10-15 09:00+09', '2026-10-15 10:00+09', 'black');
    raise exception 'Invalid color allowed';
  exception when check_violation then null; end;
  update public.schedules set title = '위조' where title = '수업 B';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign update allowed'; end if;
  delete from public.schedules where title = '수업 B';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign deletion allowed'; end if;
  delete from public.schedules where title = '수업 C';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Own deletion failed'; end if;
end $$;

rollback;
select 'schedules permission and constraint tests passed (rolled back)' as result;
