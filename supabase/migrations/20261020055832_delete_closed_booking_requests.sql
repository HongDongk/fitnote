-- 거절·취소된 수업 신청은 기록을 남기지 않고 바로 삭제합니다.
delete from public.booking_requests where status in ('rejected', 'cancelled');

create or replace function private.change_booking_request(request_id uuid, action text)
returns public.booking_requests language plpgsql security definer set search_path = '' as $$
declare
  result public.booking_requests;
  confirmed_schedule_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if action not in ('approved', 'rejected', 'cancelled') or action is null then
    raise exception 'Invalid booking action' using errcode = '23514';
  end if;
  select * into result from public.booking_requests where id = request_id;
  if not found then
    raise exception 'Booking request not found' using errcode = 'P0002';
  end if;
  if (action in ('approved', 'rejected') and result.instructor_id <> auth.uid())
    or (action = 'cancelled' and not exists (
      select 1 from public.members where id = result.member_id and auth_user_id = auth.uid()
    )) then
    raise exception 'Booking access denied' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(result.instructor_id::text, 0));
  select * into result from public.booking_requests where id = request_id for update;
  if not found then
    raise exception 'Booking request not found' using errcode = 'P0002';
  end if;
  if result.status <> 'pending' then
    raise exception 'Booking request is not pending' using errcode = '23514';
  end if;
  if action in ('rejected', 'cancelled') then
    delete from public.booking_requests where id = request_id returning * into result;
    return result;
  end if;
  if action = 'approved' then
    if result.starts_at <= clock_timestamp() then
      raise exception 'Booking must be in the future' using errcode = '23514';
    end if;
    if exists (select 1 from public.schedules where instructor_id = result.instructor_id
      and starts_at < result.ends_at and ends_at > result.starts_at) then
      raise exception 'Schedule conflict' using errcode = '23P01';
    end if;
    insert into public.schedules (instructor_id, title, starts_at, ends_at)
    values (result.instructor_id, '예약 수업', result.starts_at, result.ends_at)
    returning id into confirmed_schedule_id;
  end if;
  update public.booking_requests set status = action, schedule_id = confirmed_schedule_id,
    decided_at = clock_timestamp(), updated_at = clock_timestamp()
  where id = request_id returning * into result;
  return result;
end;
$$;
