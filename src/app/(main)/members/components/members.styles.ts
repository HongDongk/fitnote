import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 회원관리 화면 전용으로만 쓴다.
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

const card = {
  p: { xs: 3, sm: 4 },
  bgcolor: "white",
  borderRadius: "24px",
} satisfies SxProps<Theme>;

const badge = {
  height: 24,
  borderRadius: "6px",
  fontSize: 12,
  fontWeight: 700,
  "& .MuiChip-label": { px: 1 },
} satisfies SxProps<Theme>;

export const styles = {
  // 페이지 (page.tsx)
  page: { minHeight: "100dvh", bgcolor: grey.bg },
  main: { py: { xs: 3, sm: 6 } },

  // 제목
  title: {
    color: grey.title,
    fontSize: { xs: 26, sm: 28 },
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  description: {
    mt: 1,
    color: grey.body,
    fontSize: 16,
    lineHeight: 1.6,
    ...keepAll,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: {
      xs: "minmax(0, 1fr)",
      md: "340px minmax(0, 1fr)",
    },
    gap: { xs: 1.5, md: 2 },
    alignItems: "start",
  },

  // 카드 공통
  card,
  cardTitle: {
    color: grey.title,
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  cardDescription: {
    mt: 0.5,
    color: grey.body,
    fontSize: 15,
    ...keepAll,
  },

  // 회원 등록 폼
  form: {
    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      borderRadius: "14px",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: grey.line },
      "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
        { borderColor: grey.lineHover },
    },
    "& .MuiFormHelperText-root": { mx: 0.5, fontSize: 13 },
  },
  submitButton: {
    minHeight: 52,
    borderRadius: "14px",
    fontSize: 16,
    fontWeight: 700,
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  },
  formNote: {
    p: 2,
    borderRadius: "14px",
    bgcolor: grey.bg,
    color: grey.body,
    fontSize: 13,
    lineHeight: 1.7,
    ...keepAll,
  },

  // 회원 목록
  listHeader: { alignItems: "center" },
  countBadge: { ...badge, bgcolor: "primary.light", color: "primary.main" },
  status: { alignItems: "center", py: 6 },
  statusText: { color: grey.sub, fontSize: 15 },
  memberList: { m: 0, p: 0, listStyle: "none" },
  memberItem: {
    py: 2,
    "& + &": { borderTop: `1px solid ${grey.fill}` },
  },
  memberRow: { alignItems: "center" },
  memberAvatar: {
    bgcolor: "primary.light",
    color: "primary.main",
    fontWeight: 700,
  },
  memberInfo: { minWidth: 0, flex: 1 },
  memberName: {
    color: grey.title,
    fontSize: 16,
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  memberEmail: {
    color: grey.sub,
    fontSize: 14,
    overflowWrap: "anywhere",
  },
  memberActions: { alignItems: "center", flexShrink: 0 },
  statusBadge: badge,
  statusConnected: { bgcolor: "primary.light", color: "primary.main" },
  statusPending: { bgcolor: grey.fill, color: grey.body },
  deleteButton: {
    width: 44,
    height: 44,
    color: grey.sub,
    "&:hover": { bgcolor: grey.fill },
  },

  // 빈 상태
  empty: { alignItems: "center", py: 6, textAlign: "center" },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    bgcolor: grey.fill,
    color: grey.sub,
  },
  emptyIcon: { fontSize: 30 },
  emptyTitle: { color: grey.title, fontSize: 17, fontWeight: 700 },
  emptyDescription: { color: grey.body, fontSize: 15, ...keepAll },

  // 토스트
  snackbar: { width: "calc(100% - 32px)", maxWidth: 420 },
  toast: {
    width: "100%",
    alignItems: "center",
    bgcolor: grey.title,
    color: "white",
    borderRadius: "16px",
    fontSize: 15,
    fontWeight: 600,
    boxShadow: "none",
    "& .MuiAlert-icon": { color: "primary.light" },
  },
} satisfies Record<string, SxProps<Theme>>;
