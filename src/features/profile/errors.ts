import type { PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";

export const profileMessages = {
  invalidInput: "입력한 정보를 확인해주세요.",
  loginRequired: "로그인이 필요합니다. 다시 로그인해주세요.",
  forbidden: "내 정보를 수정할 권한이 없습니다.",
  avatarInvalid: "프로필 사진을 다시 선택해주세요.",
  avatarOwner: "본인이 업로드한 프로필 사진을 선택해주세요.",
  saveFailed: "내 정보를 저장하지 못했습니다. 다시 시도해주세요.",
  notFound: "내 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
};

export function getProfileValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fieldErrors[field] ??= issue.message;
  }
  return new ApiError(profileMessages.invalidInput, 400, fieldErrors);
}

export function getProfileDatabaseError(error: PostgrestError) {
  if (error.code === "42501") {
    return new ApiError(profileMessages.forbidden, 403);
  }

  if (
    error.code === "23514" &&
    error.message.includes("profiles_avatar_url_owner")
  ) {
    return new ApiError(profileMessages.avatarInvalid, 400, {
      avatarUrl: profileMessages.avatarOwner,
    });
  }

  return new ApiError(profileMessages.saveFailed, 500);
}

export function getProfileRequestError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(profileMessages.saveFailed, 500);
}
