"use client";

import { useMutation } from "@tanstack/react-query";

import { updateProfile } from "./api";

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile });
}
