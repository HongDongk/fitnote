"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createClient } from "@/src/lib/supabase/client";
import {
  createSchedule,
  deleteSchedule,
  getInstructorSchedules,
  updateSchedule,
  type SaveScheduleInput,
  type ScheduleSummary,
} from "./api";

function scheduleQueryKey(instructorId: string) {
  return ["schedules", "instructor", instructorId];
}

export function useInstructorSchedules(instructorId: string) {
  return useQuery({
    queryKey: scheduleQueryKey(instructorId),
    queryFn: () => getInstructorSchedules(instructorId),
    enabled: Boolean(instructorId),
  });
}

export function useScheduleRealtime(instructorId: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!instructorId) return;
    const supabase = createClient();
    const queryKey = scheduleQueryKey(instructorId);
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey });
    };
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    // 로그인 토큰을 먼저 실어야 로그인 상태 기준으로 구독된다.
    void supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`schedules:${instructorId}:${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "schedules",
            filter: `instructor_id=eq.${instructorId}`,
          },
          refresh,
        )
        // 삭제 이벤트에는 필터가 적용되지 않아, 현재 목록에 있는 일정인지 직접 확인한다.
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "schedules" },
          ({ old }) => {
            const schedules =
              queryClient.getQueryData<ScheduleSummary[]>(queryKey);
            if (schedules?.some((schedule) => schedule.id === old.id)) {
              refresh();
            }
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") refresh();
        });
    });
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [instructorId, queryClient]);
}

export function useSaveSchedule(instructorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      values,
    }: {
      scheduleId: string | null;
      values: SaveScheduleInput;
    }) =>
      scheduleId
        ? updateSchedule(instructorId, scheduleId, values)
        : createSchedule(instructorId, values),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKey(instructorId),
      }),
  });
}

export function useDeleteSchedule(instructorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) =>
      deleteSchedule(instructorId, scheduleId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKey(instructorId),
      }),
  });
}
