"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSchedule,
  deleteSchedule,
  getInstructorSchedules,
  updateSchedule,
  type SaveScheduleInput,
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
