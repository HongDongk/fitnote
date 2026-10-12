"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMember,
  getInstructorMembers,
  getMyMember,
  linkMemberAccount,
  requestMemberLogin,
  type CreateMemberInput,
} from "./api";

export function useInstructorMembers(instructorId: string) {
  return useQuery({
    queryKey: ["members", "instructor", instructorId],
    queryFn: () => getInstructorMembers(instructorId),
    enabled: Boolean(instructorId),
    retry: false,
  });
}

export function useCreateMember(instructorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateMemberInput) =>
      createMember(instructorId, values),
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["members", "instructor", instructorId],
      }),
  });
}

export function useLinkMemberAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkMemberAccount,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["members", "mine"] }),
  });
}

export function useMyMember(instructorSlug: string) {
  return useQuery({
    queryKey: ["members", "mine", instructorSlug],
    queryFn: () => getMyMember({ instructorSlug }),
    enabled: Boolean(instructorSlug),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useRequestMemberLogin() {
  return useMutation({ mutationFn: requestMemberLogin, retry: false });
}
