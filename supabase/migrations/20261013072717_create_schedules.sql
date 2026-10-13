create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (
    title = btrim(title) and char_length(title) between 1 and 80
  ),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  color text not null default 'green' check (
    color in ('green', 'blue', 'purple', 'orange', 'pink', 'teal', 'indigo', 'amber')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedules_time_range check (ends_at > starts_at)
);

create index schedules_instructor_starts_at_idx
on public.schedules (instructor_id, starts_at);

alter table public.schedules enable row level security;

revoke all on public.schedules from public, anon, authenticated;
grant select on public.schedules to anon, authenticated;
grant delete on public.schedules to authenticated;
grant insert (instructor_id, title, starts_at, ends_at, color) on public.schedules to authenticated;
grant update (title, starts_at, ends_at, color) on public.schedules to authenticated;
grant all on public.schedules to service_role;

create policy "Schedules are publicly readable"
on public.schedules for select to anon, authenticated
using (true);

create policy "Instructors can create their own schedules"
on public.schedules for insert to authenticated
with check ((select auth.uid()) = instructor_id);

create policy "Instructors can update their own schedules"
on public.schedules for update to authenticated
using ((select auth.uid()) = instructor_id)
with check ((select auth.uid()) = instructor_id);

create policy "Instructors can delete their own schedules"
on public.schedules for delete to authenticated
using ((select auth.uid()) = instructor_id);

create function public.touch_schedule_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_schedule_updated_at() from public, anon, authenticated;

create trigger touch_schedule_updated_at
before update on public.schedules
for each row execute function public.touch_schedule_updated_at();

comment on table public.schedules is 'Instructor class schedules; publicly readable, writable only by the owning instructor.';
