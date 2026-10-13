import { z } from "zod";

export const scheduleColors = [
  "green",
  "blue",
  "purple",
  "orange",
  "pink",
  "teal",
  "indigo",
  "amber",
] as const;

export const scheduleIdSchema = z.uuid({
  error: "일정 정보를 확인해주세요.",
});

export const scheduleSaveSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "수업 이름을 입력해주세요.")
      .max(80, "수업 이름은 80자 이하로 입력해주세요."),
    startsAt: z.iso.datetime({ error: "시작 시간을 확인해주세요." }),
    endsAt: z.iso.datetime({ error: "종료 시간을 확인해주세요." }),
    color: z.enum(scheduleColors, { error: "일정 색상을 확인해주세요." }),
  })
  .refine(({ startsAt, endsAt }) => new Date(endsAt) > new Date(startsAt), {
    message: "종료 시간은 시작 시간보다 늦어야 합니다.",
    path: ["endsAt"],
  });
