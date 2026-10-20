-- 예약으로 확정된 수업도 삭제할 수 있게 하고, 일정이 지워지면 해당 예약 기록도 함께 삭제합니다.
-- 확정된 예약 수업의 시간 변경은 계속 막습니다.
alter table public.booking_requests
  drop constraint booking_requests_schedule_id_fkey,
  add constraint booking_requests_schedule_id_fkey
    foreign key (schedule_id) references public.schedules (id) on delete cascade;

create or replace function private.protect_schedule_bookings()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  target_instructor_id uuid;
begin
  if tg_op = 'DELETE' then
    target_instructor_id := old.instructor_id;
  else
    target_instructor_id := new.instructor_id;
  end if;
  if tg_op = 'UPDATE' and new.instructor_id <> old.instructor_id then
    raise exception 'Schedule instructor is immutable' using errcode = '23514';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_instructor_id::text, 0));
  if tg_op = 'UPDATE' and (new.starts_at, new.ends_at) is distinct from (old.starts_at, old.ends_at) then
    if exists (select 1 from public.booking_requests where schedule_id = old.id and status = 'approved') then
      raise exception 'Approved booking schedule is immutable' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and (new.starts_at, new.ends_at) is distinct from (old.starts_at, old.ends_at)) then
    if exists (
      select 1 from public.schedules s join public.booking_requests b on b.schedule_id = s.id and b.status = 'approved'
      where s.instructor_id = target_instructor_id and s.id <> new.id
        and s.starts_at < new.ends_at and s.ends_at > new.starts_at
    ) then
      raise exception 'Approved booking conflict' using errcode = '23P01';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
