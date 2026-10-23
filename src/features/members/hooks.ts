"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMember,
  deleteMember,
  getInstructorMembers,
  getMyMember,
  linkMemberAccount,
  requestMemberLogin,
  requestMemberOAuthLogin,
  type CreateMemberInput,
  type MemberSummary,
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

export function useDeleteMember(instructorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deleteMember(instructorId, memberId),
    retry: false,
    onSuccess: async (memberId) => {
      queryClient.setQueryData<MemberSummary[]>(
        ["members", "instructor", instructorId],
        (previous) => previous?.filter((member) => member.id !== memberId),
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["members", "instructor", instructorId],
        }),
        queryClient.invalidateQueries({ queryKey: ["members", "mine"] }),
      ]);
    },
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

export function useMyMember(instructorSlug: string, accountId: string | null) {
  return useQuery({
    queryKey: ["members", "mine", instructorSlug, accountId],
    queryFn: () => getMyMember({ instructorSlug }),
    enabled: Boolean(instructorSlug && accountId),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useRequestMemberLogin() {
  return useMutation({ mutationFn: requestMemberLogin, retry: false });
}

export function useRequestMemberOAuthLogin() {
  return useMutation({ mutationFn: requestMemberOAuthLogin, retry: false });
}
