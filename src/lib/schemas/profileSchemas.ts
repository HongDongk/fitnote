import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(50, "이름은 50자 이하로 입력해주세요."),
  bio: z
    .string()
    .trim()
    .min(1, "소개글을 입력해주세요.")
    .max(500, "소개글은 500자 이하로 입력해주세요."),
});

export const profileUpdateSchema = profileSchema.extend({
  avatarUrl: z
    .string()
    .trim()
    .min(1, "프로필 사진을 선택해주세요.")
    .pipe(z.url({ error: "올바른 프로필 사진 주소가 아닙니다." })),
});

export const avatarFileSchema = z
  .file()
  .min(1, "비어 있는 파일은 업로드할 수 없습니다.")
  .max(5 * 1024 * 1024, "사진은 5MB 이하로 선택해주세요.")
  .mime(
    ["image/jpeg", "image/png", "image/webp"],
    "JPG, PNG, WebP 사진만 업로드할 수 있습니다.",
  );
