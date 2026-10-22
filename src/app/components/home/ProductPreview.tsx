import { Box, Stack, Typography } from "@mui/material";

import { styles as s } from "./home.styles";

const previewDays = ["월", "화", "수", "목", "금"];
const previewTimes = ["18:00", "19:00", "20:00"];
// [요일 인덱스, 시간 인덱스, 제목, 승인 대기 여부]
const previewEvents: [number, number, string, boolean][] = [
  [0, 0, "PT", false],
  [1, 1, "필라", false],
  [2, 0, "PT", false],
  [3, 2, "요가", false],
  [4, 1, "신청", true],
];

// 히어로용 예시 화면. 실제 데이터가 아닌 가상의 예시이며 클릭할 수 없다.
export default function ProductPreview() {
  return (
    <Box
      role="img"
      aria-label="핏노트 예시 화면: 회원의 수업 신청을 승인하면 주간 캘린더에 수업이 확정되는 모습"
      sx={s.preview}
    >
      <Stack spacing={{ xs: 1.5, sm: 2 }} aria-hidden>
        <Box sx={s.previewCard}>
          <Stack direction="row" spacing={1} sx={s.previewCardHeader}>
            <Typography sx={s.previewCardTitle}>수업 신청</Typography>
            <Box component="span" sx={s.previewCountBadge}>
              대기 1
            </Box>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={s.previewRequest}
          >
            <Stack direction="row" spacing={1.5} sx={s.previewMember}>
              <Box sx={s.previewAvatar}>김</Box>
              <Box sx={s.previewMemberInfo}>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={s.previewMemberNameRow}
                >
                  <Typography sx={s.previewMemberName}>
                    김핏노트 회원
                  </Typography>
                  <Box component="span" sx={s.previewPendingBadge}>
                    승인 대기
                  </Box>
                </Stack>
                <Typography sx={s.previewMemberTime}>
                  금요일 · 19:00 – 20:00
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Box sx={[s.previewButton, s.previewApprove]}>승인</Box>
              <Box sx={[s.previewButton, s.previewReject]}>거절</Box>
            </Stack>
          </Stack>
        </Box>

        <Box sx={s.previewCard}>
          <Typography sx={[s.previewCardTitle, { mb: 2 }]}>
            이번 주 일정
          </Typography>
          <Box sx={s.calendar}>
            <Box />
            {previewDays.map((day) => (
              <Typography key={day} sx={s.calendarDay}>
                {day}
              </Typography>
            ))}
            {previewTimes.map((time, timeIndex) => [
              <Typography key={time} sx={s.calendarTime}>
                {time}
              </Typography>,
              ...previewDays.map((day, dayIndex) => {
                const event = previewEvents.find(
                  ([d, t]) => d === dayIndex && t === timeIndex,
                );
                const cellStyle = !event
                  ? s.calendarCellEmpty
                  : event[3]
                    ? s.calendarCellPending
                    : s.calendarCellBooked;
                return (
                  <Box key={`${day}-${time}`} sx={[s.calendarCell, cellStyle]}>
                    {event?.[2]}
                  </Box>
                );
              }),
            ])}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
