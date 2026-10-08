import {
  isAuthError,
  type AuthError,
  type Session,
  type User,
} from "@supabase/supabase-js";

import { ApiError } from "@/src/lib/api/error";

export const authFormMessages = {
  duplicateSignup: "이미 가입된 이메일입니다. 로그인해주세요.",
  signupProfileError:
    "계정은 생성됐지만 프로필 저장에 실패했습니다. 다시 로그인해주세요.",
  signinProfileError:
    "로그인은 완료됐지만 프로필을 불러오지 못했습니다. 다시 시도해주세요.",
  unexpectedError:
    "처리 중 문제가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
};

export function getSignupResponseError({
  user,
  session,
}: {
  user: Pick<User, "identities"> | null;
  session: Session | null;
}) {
  if (!user) {
    return new ApiError(authFormMessages.unexpectedError, 500);
  }
  if (!session && user.identities?.length === 0) {
    return new ApiError(authFormMessages.duplicateSignup, 409);
  }

  return null;
}

export function getAuthErrorMessage(error: AuthError) {
  switch (error.code) {
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "email_not_confirmed":
      return "이메일 인증이 필요합니다. 메일의 인증 링크를 확인해주세요.";
    case "email_exists":
    case "user_already_exists":
      return authFormMessages.duplicateSignup;
    case "email_address_invalid":
    case "validation_failed":
      return "입력한 이메일과 비밀번호를 확인해주세요.";
    case "weak_password":
      return "비밀번호가 보안 기준에 맞지 않습니다. 더 안전한 비밀번호를 입력해주세요.";
    case "over_email_send_rate_limit":
      return "인증 메일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case "over_request_rate_limit":
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case "email_address_not_authorized":
      return "현재 이 이메일로 인증 메일을 보낼 수 없습니다. 관리자에게 문의해주세요.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "현재 이메일 회원가입을 이용할 수 없습니다. 관리자에게 문의해주세요.";
    case "user_banned":
      return "이용이 제한된 계정입니다. 관리자에게 문의해주세요.";
    case "request_timeout":
      return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
    default:
      if (error.name === "AuthRetryableFetchError") {
        return "서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
      }
      if (error.status === 429) {
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      }
      return "인증 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export function getAuthSubmitErrorMessage(error: unknown) {
  if (isAuthError(error)) {
    return getAuthErrorMessage(error);
  }
  if (error instanceof ApiError) {
    return error.message;
  }

  return authFormMessages.unexpectedError;
}

export function getLogoutErrorMessage(error: unknown) {
  return isAuthError(error)
    ? "로그아웃에 실패했습니다. 다시 시도해주세요."
    : "로그아웃에 실패했습니다. 인터넷 연결을 확인해주세요.";
}
