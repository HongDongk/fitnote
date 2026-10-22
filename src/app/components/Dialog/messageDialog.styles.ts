import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 메시지 다이얼로그 전용으로만 쓴다.
const grey = {
  title: "#191F28",
  body: "#4E5968",
  fill: "#F2F4F6",
  line: "#E5E8EB",
};

const button = {
  minHeight: 52,
  borderRadius: "14px",
  fontSize: 16,
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
} satisfies SxProps<Theme>;

export const styles = {
  backdrop: { bgcolor: "rgba(0, 0, 0, 0.4)" },
  paper: {
    m: "20px",
    width: "calc(100% - 40px)",
    maxHeight: "calc(100dvh - 40px)",
    borderRadius: "24px",
    boxShadow: "none",
  },
  title: {
    p: "28px 24px 8px",
    color: grey.title,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: "-0.02em",
    wordBreak: "keep-all",
  },
  content: { p: "0 24px" },
  message: {
    m: 0,
    color: grey.body,
    fontSize: 16,
    lineHeight: 1.6,
    wordBreak: "keep-all",
    overflowWrap: "anywhere",
  },
  actions: { p: "24px 20px 20px", gap: 1 },
  cancelButton: {
    ...button,
    color: grey.body,
    bgcolor: grey.fill,
    "&:hover": { bgcolor: grey.line },
  },
  confirmButton: button,
} satisfies Record<string, SxProps<Theme>>;
