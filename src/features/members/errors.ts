import { isAuthError, type PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { getAuthErrorMessage } from "@/src/features/auth/errors";
import { ApiError } from "@/src/lib/api/error";

export const memberMessages = {
  invalidInput: "입력한 정보를 확인해주세요.",
  emailRequestFailed:
    "인증 메일을 요청하지 못했습니다. 잠시 후 다시 시도해주세요.",
  verificationRequired: "이메일 인증을 완료한 계정으로 로그인해주세요.",
  notLinked:
    "연결 가능한 회원 정보를 찾지 못했습니다. 강사에게 등록 이메일을 확인해주세요.",
  notReady:
    "회원 연결 기능이 아직 적용되지 않았습니다. 관리자에게 문의해주세요.",
  linkFailed: "회원 정보를 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
  loginRequired: "회원 정보를 확인하려면 로그인해주세요.",
  instructorNotFound: "강사 정보를 찾지 못했습니다. 공개주소를 확인해주세요.",
  readFailed: "회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
  callbackInvalid:
    "인증 링크가 유효하지 않거나 만료되었습니다. 인증 메일을 다시 요청해주세요.",
  callbackFailed: "회원 인증 처리에 실패했습니다. 잠시 후 다시 시도해주세요.",
  forbidden: "본인의 회원 정보만 관리할 수 있습니다.",
  authCheckFailed:
    "로그인 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
  createFailed: "회원을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.",
  duplicateEmail: "이미 등록된 회원 이메일입니다.",
  managementNotReady:
    "회원 관리 기능이 아직 적용되지 않았습니다. 관리자에게 문의해주세요.",
  deleteFailed: "회원을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
  memberNotFound: "회원을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.",
};

export function getMemberValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fieldErrors[field] ??= issue.message;
  }
  return new ApiError(memberMessages.invalidInput, 400, fieldErrors);
}

export function getMemberDatabaseError(error: PostgrestError) {
  if (error.code === "42501" || error.code === "PGRST301") {
    return new ApiError(memberMessages.verificationRequired, 403);
  }
  if (error.code === "PGRST202") {
    return new ApiError(memberMessages.notReady, 503);
  }
  return new ApiError(memberMessages.linkFailed, 500);
}

export function getMemberRequestError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(memberMessages.linkFailed, 500);
}

export function getMemberAuthRequestError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }
  if (isAuthError(error)) {
    return new ApiError(getAuthErrorMessage(error), error.status || 500);
  }
  return new ApiError(memberMessages.emailRequestFailed, 500);
}

export function getMemberCallbackError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(memberMessages.callbackFailed, 500);
}

export function getMemberCallbackMessage(key: string | undefined) {
  if (key === "auth") {
    return memberMessages.callbackInvalid;
  }
  if (key === "link") {
    return memberMessages.notLinked;
  }
  if (key === "callback") {
    return memberMessages.callbackFailed;
  }
  return "";
}

export function getMemberReadError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(memberMessages.readFailed, 500);
}

export function getMemberCreateDatabaseError(error: PostgrestError) {
  if (error.code === "23505") {
    return new ApiError(memberMessages.duplicateEmail, 409, {
      email: memberMessages.duplicateEmail,
    });
  }
  if (error.code === "42501") {
    return new ApiError(memberMessages.forbidden, 403);
  }
  if (error.code === "23503") {
    return new ApiError(memberMessages.instructorNotFound, 403);
  }
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new ApiError(memberMessages.managementNotReady, 503);
  }
  return new ApiError(memberMessages.createFailed, 500);
}

export function getMemberCreateRequestError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(memberMessages.createFailed, 500);
}

export function getMemberManagementErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : memberMessages.readFailed;
}

export function getMemberDeleteDatabaseError(error: PostgrestError) {
  if (error.code === "42501") {
    return new ApiError(memberMessages.forbidden, 403);
  }
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new ApiError(memberMessages.managementNotReady, 503);
  }
  return new ApiError(memberMessages.deleteFailed, 500);
}

export function getMemberDeleteRequestError(error: unknown) {
  return error instanceof ApiError
    ? error
    : new ApiError(memberMessages.deleteFailed, 500);
}
