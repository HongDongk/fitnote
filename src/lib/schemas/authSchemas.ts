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
