import type { PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";

export const scheduleMessages = {
  invalidInput: "입력한 일정 정보를 확인해주세요.",
  loginRequired: "일정을 관리하려면 로그인해주세요.",
  authCheckFailed:
    "로그인 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
  forbidden: "본인의 일정만 관리할 수 있습니다.",
  readFailed: "일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
  saveFailed: "일정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
  deleteFailed: "일정을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
  notFound: "일정을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.",
  notReady: "일정 기능이 아직 적용되지 않았습니다. 관리자에게 문의해주세요.",
};

export function getScheduleValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fieldErrors[field] ??= issue.message;
  }
  return new ApiError(
    Object.values(fieldErrors)[0] ?? scheduleMessages.invalidInput,
    400,
    fieldErrors,
  );
}

export function getScheduleDatabaseError(
  error: PostgrestError,
  fallback: string,
) {
  if (error.code === "42501") {
    return new ApiError(scheduleMessages.forbidden, 403);
  }
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new ApiError(scheduleMessages.notReady, 503);
  }
  if (error.code === "23514") {
    return new ApiError(scheduleMessages.invalidInput, 400);
  }
  return new ApiError(fallback, 500);
}

export function getScheduleRequestError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error : new ApiError(fallback, 500);
}

export function getScheduleErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : scheduleMessages.readFailed;
}
