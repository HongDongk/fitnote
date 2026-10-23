import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 강사 공개 페이지([slug]) 전용으로만 쓴다.
const grey = {
  title: "#191F28",
  body: "#4E5968",
  sub: "#8B95A1",
  bg: "#F9FAFB",
  fill: "#F2F4F6",
  line: "#E5E8EB",
  lineHover: "#D1D6DB",
};

const keepAll = { wordBreak: "keep-all" } as const;

const sectionTitle = {
  color: grey.title,
  fontSize: { xs: 20, sm: 22 },
  fontWeight: 700,
  letterSpacing: "-0.02em",
  ...keepAll,
} satisfies SxProps<Theme>;

const sectionDescription = {
  mt: 0.5,
  color: grey.body,
  fontSize: 15,
  lineHeight: 1.6,
  ...keepAll,
} satisfies SxProps<Theme>;

const badge = {
  height: 24,
  borderRadius: "6px",
  fontSize: 12,
  fontWeight: 700,
  flexShrink: 0,
  "& .MuiChip-label": { px: 1 },
} satisfies SxProps<Theme>;

const outlinedInput = {
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    borderRadius: "14px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: grey.line },
    "&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
      { borderColor: grey.lineHover },
  },
  "& .MuiFormHelperText-root": { mx: 0.5, fontSize: 13 },
} satisfies SxProps<Theme>;

const button = {
  borderRadius: "14px",
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
} satisfies SxProps<Theme>;

const greyButton = {
  ...button,
  color: grey.body,
  bgcolor: grey.fill,
  "&:hover": { bgcolor: grey.line },
} satisfies SxProps<Theme>;

const toast = {
  width: "100%",
  alignItems: "center",
  bgcolor: grey.title,
  color: "white",
  borderRadius: "16px",
  fontSize: 15,
  fontWeight: 600,
  boxShadow: "none",
  "& .MuiAlert-icon": { color: "primary.light" },
} satisfies SxProps<Theme>;

export const styles = {
  // 페이지 (page.tsx)
  page: { minHeight: "100dvh", bgcolor: grey.bg },
  main: { py: { xs: 3, sm: 6 } },
  errorPage: { py: 6 },
  card: {
    p: { xs: 2.5, sm: 4 },
    bgcolor: "white",
    borderRadius: "24px",
  },
  profile: {
    alignItems: "center",
    p: { xs: 2, sm: 2.5 },
    borderRadius: "20px",
    bgcolor: grey.bg,
  },
  profileAvatar: {
    width: { xs: 56, sm: 64 },
    height: { xs: 56, sm: 64 },
    flexShrink: 0,
    bgcolor: "primary.light",
    color: "primary.main",
    fontWeight: 700,
  },
  profileText: { minWidth: 0 },
  profileName: {
    color: grey.title,
    fontSize: { xs: 20, sm: 22 },
    fontWeight: 700,
    letterSpacing: "-0.02em",
    overflowWrap: "anywhere",
  },
  profileBio: {
    mt: 0.5,
    color: grey.body,
    fontSize: 15,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  sectionTitle,
  sectionDescription,

  // 회원 로그인 (MemberAccess)
  accessDivider: {
    color: grey.sub,
    fontSize: 14,
    "&::before, &::after": { borderColor: grey.line },
  },
  accessForm: {
    ...outlinedInput,
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: grey.sub },
    "& .MuiFormHelperText-root": {
      minHeight: 23,
      mx: 0.5,
      fontSize: 13,
      lineHeight: "20px",
    },
  },
  accessSubmit: {
    ...button,
    mt: 1,
    minHeight: 56,
    borderRadius: "16px",
    fontSize: 17,
    fontWeight: 700,
  },
  // 회원 로그인 모달 (MemberLogin)
  loginBackdrop: { bgcolor: "rgba(0, 0, 0, 0.4)" },
  loginPaper: {
    position: "relative",
    m: "20px",
    width: "calc(100% - 40px)",
    maxHeight: "calc(100dvh - 40px)",
    p: { xs: "28px 20px 24px", sm: "32px 28px 28px" },
    borderRadius: "24px",
    boxShadow: "none",
  },
  loginClose: {
    position: "absolute",
    top: 12,
    right: 12,
    color: grey.sub,
  },
  sent: { textAlign: "center", alignItems: "center" },
  sentIconBox: {
    width: 64,
    height: 64,
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    bgcolor: "primary.light",
    color: "primary.main",
  },
  sentIcon: { fontSize: 32 },
  sentEmail: {
    color: grey.title,
    fontWeight: 600,
    overflowWrap: "anywhere",
    maxWidth: "100%",
  },
  sentConfirm: { ...button, minHeight: 56, fontSize: 17, fontWeight: 700 },
  sentActions: { flexWrap: "wrap", justifyContent: "center" },
  textButton: {
    color: grey.body,
    fontWeight: 600,
    borderRadius: "10px",
    "&:hover": { bgcolor: grey.fill },
  },

  // 수업 신청 목록 (BookingRequests)
  requests: {
    p: { xs: 2, sm: 3 },
    bgcolor: grey.bg,
    borderRadius: "20px",
  },
  requestsHeader: { alignItems: "center" },
  requestsTitle: { ...sectionTitle, fontSize: { xs: 18, sm: 19 } },
  countBadge: { ...badge, bgcolor: "primary.light", color: "primary.main" },
  skeleton: { borderRadius: "16px" },
  empty: { py: 4, alignItems: "center", textAlign: "center" },
  emptyIcon: { fontSize: 32, color: grey.sub },
  emptyText: { color: grey.sub, fontSize: 15 },
  requestItem: { p: 2, borderRadius: "16px", bgcolor: "white" },
  requestRow: {
    justifyContent: "space-between",
    alignItems: { sm: "center" },
  },
  requestInfo: { minWidth: 0 },
  requestTitleRow: { alignItems: "center", mb: 0.5 },
  requestTitle: {
    color: grey.title,
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  statusBadge: badge,
  statusApproved: { bgcolor: "primary.light", color: "primary.main" },
  statusDefault: { bgcolor: grey.fill, color: grey.body },
  requestTime: { color: grey.body, fontSize: 14 },
  requestPastNote: {
    display: "block",
    mt: 0.75,
    color: grey.sub,
    fontSize: 13,
  },
  requestActions: { flexShrink: 0 },
  requestButton: { ...button, minHeight: 40, px: 2 },
  requestGreyButton: { ...greyButton, minHeight: 40, px: 2 },

  // 토스트 (BookingRequests, ScheduleCalendar)
  toast,
  toastError: {
    bgcolor: "error.main",
    "& .MuiAlert-icon": { color: "white" },
  },

  // 일정 캘린더 (ScheduleCalendar)
  calendarBox: {
    height: { xs: 640, sm: 720 },
    minWidth: 0,
    overflow: "hidden",
  },
  calendar: {
    height: "100%",
    "& .MuiEventCalendar-headerToolbar": { flexWrap: "wrap", gap: 1 },
    "& .MuiEventCalendar-headerToolbarSidePanelToggle, & .MuiEventCalendar-sidePanelCollapse, & .MuiEventCalendar-dayTimeGridAllDayEventsGrid":
      { display: "none" },
    "& .MuiEventCalendar-headerToolbarActions": {
      alignItems: "center",
      gap: 1,
    },
    "& .MuiEventCalendar-headerToolbarDateNavigator": { gap: 1 },
    "& .MuiEventCalendar-headerToolbarPreviousButton, & .MuiEventCalendar-headerToolbarNextButton, & .MuiEventCalendar-headerToolbarCompactMenuButton":
      {
        width: 40,
        height: 40,
        border: 0,
        borderRadius: "10px",
        bgcolor: grey.fill,
        color: grey.body,
        "&:hover": { bgcolor: grey.line },
      },
    "& .MuiEventCalendar-headerToolbarTodayButton, & .MuiEventCalendar-headerToolbarCompactTodayButton":
      {
        height: 40,
        minHeight: 40,
        border: 0,
        bgcolor: grey.fill,
        color: grey.body,
        boxShadow: "none",
        transition: "background-color 160ms ease",
        "&:hover": { bgcolor: grey.line },
        "&.Mui-focusVisible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 3,
        },
      },
    "& .MuiEventCalendar-headerToolbarTodayButton": {
      minWidth: 64,
      px: 2,
      borderRadius: "10px",
      fontSize: 14,
      fontWeight: 600,
    },
    "& .MuiEventCalendar-headerToolbarCompactTodayButton": {
      width: 40,
      borderRadius: "10px",
      "& .MuiSvgIcon-root": { fontSize: 20 },
    },
    "& .MuiEventCalendar-headerToolbarLeftElement > p": {
      fontWeight: 700,
      color: grey.title,
    },
    "& .MuiEventCalendar-timeGridEvent": {
      borderRadius: "8px",
      "--time-grid-event-column-gap": "0px",
    },
    // ScheduleCalendar의 timeGridColumnClass와 같은 클래스
    "& .MuiEventCalendar-dayTimeGridColumn": {
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTouchCallout: "none",
    },
  },

  // 일정 등록·신청 다이얼로그 (ScheduleCalendar)
  dialogBackdrop: { bgcolor: "rgba(0, 0, 0, 0.4)" },
  dialogPaper: { m: 2.5, borderRadius: "24px", boxShadow: "none" },
  dialogTitle: {
    px: 3,
    pt: 3.5,
    color: grey.title,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  dialogContent: { px: 3 },
  dialogFields: { pt: 1, ...outlinedInput },
  dialogActions: { p: "24px 20px 20px", gap: 1 },
  dialogButton: { ...button, minHeight: 52, fontSize: 16 },
  dialogCancel: { ...greyButton, minHeight: 52, fontSize: 16 },
  dialogDelete: {
    ...greyButton,
    minHeight: 52,
    fontSize: 16,
    color: "error.main",
  },
} satisfies Record<string, SxProps<Theme>>;
