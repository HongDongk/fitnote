import type { PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";

export const bookingMessages = {
  invalidInput:
    "입력한 시간 또는 예약 상태를 확인해주세요. 이미 처리된 신청일 수 있습니다.",
  loginRequired: "수업을 신청하려면 로그인해주세요.",
  authCheckFailed:
    "로그인 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
  forbidden: "이 예약에 접근할 권한이 없습니다. 회원 연결 상태를 확인해주세요.",
  readFailed:
    "수업 신청 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
  saveFailed: "수업 신청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  conflict: "이미 확정된 수업과 시간이 겹칩니다. 다른 시간을 선택해주세요.",
  duplicate: "같은 시간에 대기 중인 신청이 이미 있습니다.",
  notFound: "수업 신청을 찾을 수 없습니다. 새로고침 후 다시 확인해주세요.",
  notReady:
    "수업 신청 기능이 아직 적용되지 않았습니다. 관리자에게 문의해주세요.",
};

export function getBookingValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fieldErrors[field] ??= issue.message;
  }
  return new ApiError(
    Object.values(fieldErrors)[0] ?? bookingMessages.invalidInput,
    400,
    fieldErrors,
  );
}

export function getBookingDatabaseError(
  error: PostgrestError,
  fallback: string,
) {
  if (error.code === "23P01") {
    return new ApiError(bookingMessages.conflict, 409);
  }
  if (error.code === "23505") {
    return new ApiError(bookingMessages.duplicate, 409);
  }
  if (error.code === "23514") {
    return new ApiError(bookingMessages.invalidInput, 409);
  }
  if (error.code === "42501") {
    return new ApiError(bookingMessages.forbidden, 403);
  }
  if (error.code === "P0002") {
    return new ApiError(bookingMessages.notFound, 404);
  }
  if (["PGRST202", "PGRST205", "42P01"].includes(error.code)) {
    return new ApiError(bookingMessages.notReady, 503);
  }
  return new ApiError(fallback, 500);
}

export function getBookingRequestError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error : new ApiError(fallback, 500);
}

export function getBookingErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : bookingMessages.saveFailed;
}
