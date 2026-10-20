-- 다른 화면에서 바뀐 일정도 바로 보이도록 schedules 변경을 실시간으로 내보냅니다.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'schedules') then
    alter publication supabase_realtime add table public.schedules;
  end if;
end;
$$;
