import { z } from "zod";

export const bookingIdSchema = z.uuid({ error: "예약 정보를 확인해주세요." });

export const bookingRequestSchema = z
  .object({
    startsAt: z.iso.datetime({ error: "시작 시간을 확인해주세요." }),
    endsAt: z.iso.datetime({ error: "종료 시간을 확인해주세요." }),
  })
  .refine(({ startsAt }) => Date.parse(startsAt) > Date.now(), {
    message: "현재 시간 이후의 수업만 신청할 수 있습니다.",
    path: ["startsAt"],
  })
  .refine(({ startsAt, endsAt }) => Date.parse(endsAt) > Date.parse(startsAt), {
    message: "종료 시간은 시작 시간보다 늦어야 합니다.",
    path: ["endsAt"],
  })
  .refine(
    ({ startsAt, endsAt }) =>
      [startsAt, endsAt].every((value) => Date.parse(value) % 1_800_000 === 0),
    { message: "수업 시간은 30분 단위로 선택해주세요.", path: ["endsAt"] },
  );

export const bookingChangeSchema = z.object({
  requestId: bookingIdSchema,
  action: z.enum(["approve", "reject", "cancel"], {
    error: "예약 처리 방법을 확인해주세요.",
  }),
});
