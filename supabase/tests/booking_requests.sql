-- Run against a migrated local/test database only. Fixtures are rolled back.
begin;

insert into auth.users (id, email, email_confirmed_at) values
  ('11111111-1111-4111-8111-111111111111', 'teacher-a@example.com', now()),
  ('22222222-2222-4222-8222-222222222222', 'teacher-b@example.com', now()),
  ('33333333-3333-4333-8333-333333333333', 'member-a@example.com', now()),
  ('44444444-4444-4444-8444-444444444444', 'member-b@example.com', now()),
  ('55555555-5555-4555-8555-555555555555', 'member-c@example.com', now()),
  ('66666666-6666-4666-8666-666666666666', 'unverified@example.com', null);

insert into public.profiles (id, display_name, slug) values
  ('11111111-1111-4111-8111-111111111111', '강사 A', 'booking-test-a'),
  ('22222222-2222-4222-8222-222222222222', '강사 B', 'booking-test-b');

insert into public.members (instructor_id, auth_user_id, name, email) values
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '회원 A', 'member-a@example.com'),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', '회원 B', 'member-b@example.com'),
  ('22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555', '회원 C', 'member-c@example.com'),
  ('11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', '미인증 회원', 'unverified@example.com');

insert into public.schedules (instructor_id, title, starts_at, ends_at) values
  ('11111111-1111-4111-8111-111111111111', '기존 수업', '2099-01-01 09:00+09', '2099-01-01 10:00+09');

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
set local role authenticated;
do $$
declare requested public.booking_requests;
begin
  requested := public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 10:00+09', '2099-01-01 11:00+09');
  perform set_config('test.booking_a', requested.id::text, true);
  if requested.status <> 'pending' or requested.schedule_id is not null then
    raise exception 'New request is not pending without a schedule';
  end if;
  if (select count(*) from public.booking_requests) <> 1 then
    raise exception 'Member cannot read own request';
  end if;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 10:00+09', '2099-01-01 11:00+09');
    raise exception 'Duplicate pending request allowed';
  exception when unique_violation then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 09:30+09', '2099-01-01 10:30+09');
    raise exception 'Request overlapping a confirmed schedule allowed';
  exception when exclusion_violation then null; end;
  begin
    perform public.request_booking('22222222-2222-4222-8222-222222222222', '2099-01-01 10:00+09', '2099-01-01 11:00+09');
    raise exception 'Request for an unrelated instructor allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 12:00+09', '2099-01-01 11:00+09');
    raise exception 'Reversed range allowed';
  exception when check_violation then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2000-01-01 12:00+09', '2000-01-01 13:00+09');
    raise exception 'Past request allowed';
  exception when check_violation then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 12:15+09', '2099-01-01 13:00+09');
    raise exception 'Off-grid start allowed';
  exception when check_violation then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 12:00+09', '2099-01-01 13:00:01+09');
    raise exception 'Off-grid end allowed';
  exception when check_violation then null; end;
  begin
    update public.booking_requests set status = 'approved';
    raise exception 'Direct request update allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.booking_requests;
    raise exception 'Direct request deletion allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.booking_requests (instructor_id, member_id, starts_at, ends_at)
    values ('11111111-1111-4111-8111-111111111111', requested.member_id, '2099-01-02 10:00+09', '2099-01-02 11:00+09');
    raise exception 'Direct request insertion allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.approve_booking_request(requested.id);
    raise exception 'Member approval allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
do $$
declare requested public.booking_requests;
begin
  if exists (select 1 from public.booking_requests) then raise exception 'Member can read another member request'; end if;
  requested := public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-01 10:00+09', '2099-01-01 11:00+09');
  perform set_config('test.booking_b', requested.id::text, true);
  begin
    perform public.cancel_booking_request(current_setting('test.booking_a')::uuid);
    raise exception 'Member can cancel another member request';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
do $$ begin
  perform public.request_booking('22222222-2222-4222-8222-222222222222', '2099-01-01 10:00+09', '2099-01-01 11:00+09');
end $$;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
  if (select count(*) from public.booking_requests) <> 1 then raise exception 'Instructor can read foreign requests'; end if;
  begin
    perform public.approve_booking_request(current_setting('test.booking_a')::uuid);
    raise exception 'Foreign instructor approval allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.reject_booking_request(current_setting('test.booking_a')::uuid);
    raise exception 'Foreign instructor rejection allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$
declare approved public.booking_requests;
begin
  if (select count(*) from public.booking_requests) <> 2 then raise exception 'Instructor own requests unavailable'; end if;
  approved := public.approve_booking_request(current_setting('test.booking_a')::uuid);
  if approved.status <> 'approved' or approved.schedule_id is null or approved.decided_at is null then
    raise exception 'Approval did not set schedule/status/decision time';
  end if;
  if not exists (
    select 1 from public.schedules where id = approved.schedule_id
      and instructor_id = approved.instructor_id and starts_at = approved.starts_at
      and ends_at = approved.ends_at and title = '예약 수업'
  ) then raise exception 'Approval schedule missing or leaked member information'; end if;
  begin
    perform public.approve_booking_request(approved.id);
    raise exception 'Repeated approval allowed';
  exception when check_violation then null; end;
  begin
    perform public.approve_booking_request(current_setting('test.booking_b')::uuid);
    raise exception 'Overlapping pending request approval allowed';
  exception when exclusion_violation then null; end;
  if not exists (select 1 from public.booking_requests where id = current_setting('test.booking_b')::uuid and status = 'pending' and schedule_id is null) then
    raise exception 'Failed approval partially changed request';
  end if;
  begin
    update public.schedules set starts_at = '2099-01-01 12:00+09', ends_at = '2099-01-01 13:00+09' where id = approved.schedule_id;
    raise exception 'Approved schedule time change allowed';
  exception when check_violation then null; end;
  begin
    delete from public.schedules where id = approved.schedule_id;
    raise exception 'Approved schedule deletion allowed';
  exception when check_violation then null; end;
  update public.schedules set title = '수업 제목 수정', color = 'blue' where id = approved.schedule_id;
  if not exists (select 1 from public.schedules where id = approved.schedule_id and title = '수업 제목 수정' and color = 'blue') then
    raise exception 'Approved schedule display update failed';
  end if;
  begin
    insert into public.schedules (instructor_id, title, starts_at, ends_at)
    values (auth.uid(), '겹치는 수동 수업', '2099-01-01 10:30+09', '2099-01-01 11:30+09');
    raise exception 'Manual schedule overlapping approved schedule allowed';
  exception when exclusion_violation then null; end;
  if (public.reject_booking_request(current_setting('test.booking_b')::uuid)).status <> 'rejected' then
    raise exception 'Rejection failed';
  end if;
  begin
    perform public.reject_booking_request(current_setting('test.booking_b')::uuid);
    raise exception 'Repeated rejection allowed';
  exception when check_violation then null; end;
  begin
    perform public.approve_booking_request('99999999-9999-4999-8999-999999999999');
    raise exception 'Missing request approval allowed';
  exception when no_data_found then null; end;
end $$;

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
do $$
declare requested public.booking_requests;
begin
  begin
    perform public.cancel_booking_request(current_setting('test.booking_a')::uuid);
    raise exception 'Approved request cancellation allowed';
  exception when check_violation then null; end;
  requested := public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-02 10:00+09', '2099-01-02 10:30+09');
  if (public.cancel_booking_request(requested.id)).status <> 'cancelled' then raise exception 'Own cancellation failed'; end if;
  begin
    perform public.cancel_booking_request(requested.id);
    raise exception 'Repeated cancellation allowed';
  exception when check_violation then null; end;
end $$;

select set_config('request.jwt.claim.sub', '66666666-6666-4666-8666-666666666666', true);
do $$ begin
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-02 12:00+09', '2099-01-02 13:00+09');
    raise exception 'Unverified member request allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-02 12:00+09', '2099-01-02 13:00+09');
    raise exception 'Authenticated role without user can request';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role anon;
do $$ begin
  begin perform * from public.booking_requests; raise exception 'Anonymous request read allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.request_booking('11111111-1111-4111-8111-111111111111', '2099-01-02 12:00+09', '2099-01-02 13:00+09');
    raise exception 'Anonymous request allowed';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
rollback;
select 'booking request permission and lifecycle tests passed (rolled back)' as result;
