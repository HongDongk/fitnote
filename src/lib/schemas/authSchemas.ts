import type { AuthError, Session, User } from "@supabase/supabase-js";
import { z } from "zod";

export type AuthMode = "sign-in" | "sign-up";
export type FieldName =
  | "displayName"
  | "email"
  | "password"
  | "passwordConfirm";
export type FieldErrors = Partial<Record<FieldName, string>>;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요.")
    .pipe(z.email({ error: "올바른 이메일 주소를 입력해주세요." })),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const signUpSchema = signInSchema
  .extend({
    displayName: z
      .string()
      .trim()
      .min(1, "이름을 입력해주세요.")
      .max(50, "이름은 50자 이하로 입력해주세요."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .min(6, "비밀번호는 6자 이상 입력해주세요."),
    passwordConfirm: z.string().min(1, "비밀번호를 다시 입력해주세요."),
  })
  .refine(
    ({ password, passwordConfirm }) =>
      !passwordConfirm || password === passwordConfirm,
    {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["passwordConfirm"],
    },
  );

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
    return authFormMessages.unexpectedError;
  }
  if (!session && user.identities?.length === 0) {
    return authFormMessages.duplicateSignup;
  }

  return null;
}

export function validateAuthForm(
  mode: AuthMode,
  values: Record<FieldName, string>,
): FieldErrors {
  const schema = mode === "sign-up" ? signUpSchema : signInSchema;
  const result = schema.safeParse(values);
  const errors: FieldErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldName;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  return errors;
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
