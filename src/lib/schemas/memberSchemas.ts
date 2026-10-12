import { z } from "zod";

import { signInSchema } from "./authSchemas";

export const memberLinkSchema = z.object({
  instructorSlug: z
    .string()
    .trim()
    .min(3, "강사 공개주소를 확인해주세요.")
    .max(40, "강사 공개주소를 확인해주세요.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "강사 공개주소를 확인해주세요."),
});

export const memberLoginSchema = memberLinkSchema.extend({
  email: signInSchema.shape.email,
});

export const memberCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "회원 이름을 입력해주세요.")
    .max(50, "회원 이름은 50자 이하로 입력해주세요."),
  email: signInSchema.shape.email.pipe(
    z.string().max(254, "이메일은 254자 이하로 입력해주세요.").toLowerCase(),
  ),
});

export const memberCallbackSchema = memberLinkSchema
  .extend({
    code: z.string().min(1, "인증 코드를 확인해주세요.").optional(),
    tokenHash: z.string().min(1, "인증 링크를 확인해주세요.").optional(),
    type: z.literal("email").optional(),
  })
  .refine(({ code, tokenHash }) => Boolean(code) !== Boolean(tokenHash), {
    message: "유효한 인증 링크가 필요합니다.",
    path: ["code"],
  })
  .refine(({ tokenHash, type }) => !tokenHash || type === "email", {
    message: "이메일 인증 링크를 확인해주세요.",
    path: ["type"],
  });
