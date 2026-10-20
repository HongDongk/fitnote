alter table public.members add constraint members_id_instructor_key unique (id, instructor_id);

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  member_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  schedule_id uuid unique references public.schedules (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  foreign key (member_id, instructor_id) references public.members (id, instructor_id),
  check (isfinite(starts_at) and isfinite(ends_at) and ends_at > starts_at),
  check (mod(extract(epoch from starts_at), 1800) = 0 and mod(extract(epoch from ends_at), 1800) = 0),
  check (
    (status = 'pending' and schedule_id is null and decided_at is null)
    or (status = 'approved' and schedule_id is not null and decided_at is not null)
    or (status in ('rejected', 'cancelled') and schedule_id is null and decided_at is not null)
  )
);

create index booking_requests_instructor_status_idx on public.booking_requests (instructor_id, status, created_at);
create index booking_requests_member_idx on public.booking_requests (member_id, created_at);
create unique index booking_requests_pending_time_key on public.booking_requests (member_id, starts_at, ends_at) where status = 'pending';

alter table public.booking_requests enable row level security;
revoke all on public.booking_requests from public, anon, authenticated;
grant select on public.booking_requests to authenticated;
grant all on public.booking_requests to service_role;

create policy "Instructors can read their booking requests" on public.booking_requests
for select to authenticated using ((select auth.uid()) = instructor_id);
create policy "Members can read their booking requests" on public.booking_requests
for select to authenticated using (exists (
  select 1 from public.members m where m.id = member_id and m.instructor_id = booking_requests.instructor_id
  and m.auth_user_id = (select auth.uid())
));

create schema if not exists private;
grant usage on schema private to authenticated;

create function private.request_booking(target_instructor_id uuid, requested_starts_at timestamptz, requested_ends_at timestamptz)
returns public.booking_requests language plpgsql security definer set search_path = '' as $$
declare
  current_member_id uuid;
  result public.booking_requests;
begin
  if auth.uid() is null or not exists (
    select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null
  ) then
    raise exception 'Verified account required' using errcode = '42501';
  end if;
  select id into current_member_id from public.members
  where instructor_id = target_instructor_id and auth_user_id = auth.uid();
  if current_member_id is null then
    raise exception 'Member account required' using errcode = '42501';
  end if;
  if requested_starts_at is null or requested_ends_at is null
    or not isfinite(requested_starts_at) or not isfinite(requested_ends_at)
    or requested_ends_at <= requested_starts_at
    or mod(extract(epoch from requested_starts_at), 1800) <> 0
    or mod(extract(epoch from requested_ends_at), 1800) <> 0 then
    raise exception 'Invalid booking time' using errcode = '23514';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_instructor_id::text, 0));
  if requested_starts_at <= clock_timestamp() then
    raise exception 'Booking must be in the future' using errcode = '23514';
  end if;
  if exists (select 1 from public.schedules where instructor_id = target_instructor_id
    and starts_at < requested_ends_at and ends_at > requested_starts_at) then
    raise exception 'Schedule conflict' using errcode = '23P01';
  end if;
  insert into public.booking_requests (instructor_id, member_id, starts_at, ends_at)
  values (target_instructor_id, current_member_id, requested_starts_at, requested_ends_at)
  returning * into result;
  return result;
end;
$$;

create function private.change_booking_request(request_id uuid, action text)
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

create function public.request_booking(target_instructor_id uuid, requested_starts_at timestamptz, requested_ends_at timestamptz)
returns public.booking_requests language sql security invoker set search_path = '' as $$
  select private.request_booking(target_instructor_id, requested_starts_at, requested_ends_at);
$$;
create function public.approve_booking_request(request_id uuid)
returns public.booking_requests language sql security invoker set search_path = '' as $$
  select private.change_booking_request(request_id, 'approved');
$$;
create function public.reject_booking_request(request_id uuid)
returns public.booking_requests language sql security invoker set search_path = '' as $$
  select private.change_booking_request(request_id, 'rejected');
$$;
create function public.cancel_booking_request(request_id uuid)
returns public.booking_requests language sql security invoker set search_path = '' as $$
  select private.change_booking_request(request_id, 'cancelled');
$$;

revoke all on function private.request_booking(uuid, timestamptz, timestamptz), private.change_booking_request(uuid, text),
  public.request_booking(uuid, timestamptz, timestamptz), public.approve_booking_request(uuid),
  public.reject_booking_request(uuid), public.cancel_booking_request(uuid) from public, anon, authenticated;
grant execute on function private.request_booking(uuid, timestamptz, timestamptz), private.change_booking_request(uuid, text),
  public.request_booking(uuid, timestamptz, timestamptz), public.approve_booking_request(uuid),
  public.reject_booking_request(uuid), public.cancel_booking_request(uuid) to authenticated;

-- 수동 일정도 승인과 같은 강사 단위 잠금을 사용해 동시 중복 확정을 방지합니다.
create function private.protect_schedule_bookings()
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
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and (new.starts_at, new.ends_at) is distinct from (old.starts_at, old.ends_at)) then
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
revoke all on function private.protect_schedule_bookings() from public, anon, authenticated;
create trigger protect_schedule_bookings before insert or update or delete on public.schedules
for each row execute function private.protect_schedule_bookings();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'booking_requests') then
    alter publication supabase_realtime add table public.booking_requests;
  end if;
end;
$$;
