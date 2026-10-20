"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { ApiError } from "@/src/lib/api/error";
import { createClient } from "@/src/lib/supabase/client";
import {
  changeBookingRequest,
  getBookingRequests,
  requestBooking,
  type BookingChangeInput,
  type BookingRequestInput,
} from "./api";

export function useBookingRequests(
  instructorId: string,
  accountId: string | null,
  memberId: string | null,
  isInstructor: boolean,
) {
  return useQuery({
    queryKey: ["bookings", instructorId, accountId, memberId, isInstructor],
    queryFn: () =>
      getBookingRequests(instructorId, accountId!, memberId, isInstructor),
    enabled: Boolean(instructorId && accountId && (isInstructor || memberId)),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 30_000,
    retry: false,
  });
}

function useRefreshBookings(instructorId: string, accountId: string | null) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["bookings", instructorId, accountId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["schedules", "instructor", instructorId],
      }),
    ]);
}

export function useRequestBooking(
  instructorId: string,
  accountId: string | null,
) {
  const refresh = useRefreshBookings(instructorId, accountId);
  return useMutation({
    mutationFn: (values: BookingRequestInput) =>
      requestBooking(instructorId, values),
    retry: false,
    onSuccess: refresh,
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) return refresh();
    },
  });
}

export function useChangeBookingRequest(
  instructorId: string,
  accountId: string | null,
) {
  const refresh = useRefreshBookings(instructorId, accountId);
  return useMutation({
    mutationFn: (values: BookingChangeInput) => changeBookingRequest(values),
    retry: false,
    onSuccess: refresh,
    onError: (error) => {
      if (
        error instanceof ApiError &&
        (error.status === 409 || error.status === 404)
      ) {
        return refresh();
      }
    },
  });
}

export function useBookingRealtime(
  instructorId: string,
  accountId: string | null,
  memberId: string | null,
  isInstructor: boolean,
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!instructorId || !accountId || (!isInstructor && !memberId)) return;
    const supabase = createClient();
    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: ["bookings", instructorId, accountId],
      });
    };
    const filter = isInstructor
      ? `instructor_id=eq.${instructorId}`
      : `member_id=eq.${memberId}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    // 로그인 토큰을 먼저 실어야 RLS를 통과한 변경 이벤트를 받을 수 있다.
    void supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(
          `bookings:${instructorId}:${accountId}:${memberId ?? "instructor"}:${crypto.randomUUID()}`,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "booking_requests", filter },
          refresh,
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") refresh();
        });
    });
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [instructorId, accountId, memberId, isInstructor, queryClient]);
}
