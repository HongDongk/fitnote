"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signIn, signInWithGoogle, signOut, signUp } from "./api";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    retry: false,
    onSuccess: () => queryClient.clear(),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    retry: false,
    onSuccess: (data) => {
      if (data.session) {
        queryClient.clear();
      }
    },
  });
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: signInWithGoogle, retry: false });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    retry: false,
    onSuccess: () => queryClient.clear(),
  });
}
