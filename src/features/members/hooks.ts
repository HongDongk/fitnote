"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyMember, linkMemberAccount, requestMemberLogin } from "./api";

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
