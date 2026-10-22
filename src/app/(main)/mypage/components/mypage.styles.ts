import type { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";

// 토스 스타일 그레이 스케일. 마이페이지 전용으로만 쓴다.
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

// 파일 input은 MUI 컴포넌트가 아니므로 style 속성으로 숨긴다.
export const visuallyHidden: CSSProperties = {
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
};

export const styles = {
  // 페이지 (page.tsx)
  page: { minHeight: "100dvh", bgcolor: grey.bg },
  main: { py: { xs: 3, sm: 6 } },

  // 카드
  card: {
    p: { xs: 3, sm: 5 },
    bgcolor: "white",
    borderRadius: "24px",
  },
  overline: {
    color: "primary.main",
    fontSize: 15,
    fontWeight: 700,
  },
  title: {
    mt: 1,
    color: grey.title,
    fontSize: { xs: 26, sm: 28 },
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  description: {
    mt: 1.5,
    mb: 4,
    color: grey.body,
    fontSize: 16,
    lineHeight: 1.6,
    ...keepAll,
  },
  notice: {
    display: "block",
    mt: 1.5,
    px: 2,
    py: 1.5,
    borderRadius: "14px",
    bgcolor: "primary.light",
    color: "primary.dark",
    fontSize: 14,
    fontWeight: 600,
  },

  // 폼
  form: {
    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      borderRadius: "14px",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: grey.line },
      "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
        { borderColor: grey.lineHover },
    },
    "& .MuiFormHelperText-root": {
      minHeight: 23,
      mx: 0.5,
      fontSize: 13,
      lineHeight: "20px",
    },
  },
  bioField: { "& .MuiOutlinedInput-root": { lineHeight: 1.7 } },
  bioCounter: { "& .MuiFormHelperText-root": { textAlign: "right" } },

  // 프로필 사진
  avatarSection: { textAlign: "center", py: 1 },
  avatarButton: {
    position: "relative",
    p: 0,
    minWidth: 0,
    borderRadius: "50%",
    transition: "box-shadow 160ms ease",
    "&:hover": {
      bgcolor: "transparent",
      boxShadow: `0 0 0 6px ${grey.fill}`,
    },
    "&.Mui-disabled": { opacity: 0.6 },
  },
  avatar: {
    width: 112,
    height: 112,
    bgcolor: grey.fill,
    color: grey.sub,
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    bgcolor: "primary.main",
    color: "white",
    border: "3px solid white",
  },
  avatarBadgeIcon: { fontSize: 22 },
  avatarHelper: { mx: 0, mt: 1.5, textAlign: "center" },

  // 계정 정보
  infoList: {
    m: 0,
    px: 2,
    py: 0.5,
    bgcolor: grey.bg,
    borderRadius: "16px",
    display: "grid",
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    py: 1.5,
    "& + &": { borderTop: `1px solid ${grey.fill}` },
  },
  infoIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    flexShrink: 0,
    bgcolor: "white",
    borderRadius: "12px",
    color: grey.sub,
  },
  infoIcon: { fontSize: 19 },
  infoText: { minWidth: 0, flex: 1 },
  infoLabel: { color: grey.sub, fontSize: 13, lineHeight: 1.5 },
  infoValue: {
    m: 0,
    mt: 0.25,
    color: grey.title,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  copyButton: {
    flexShrink: 0,
    alignSelf: "center",
    minHeight: 36,
    px: 1.5,
    borderRadius: "10px",
    bgcolor: "white",
    color: grey.body,
    fontSize: 14,
    fontWeight: 600,
    "&:hover": { bgcolor: grey.line },
  },
  copyIcon: { fontSize: 16 },

  // 저장 버튼
  submitButton: {
    mt: 1,
    minHeight: 56,
    borderRadius: "16px",
    fontSize: 17,
    fontWeight: 700,
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  },
} satisfies Record<string, SxProps<Theme>>;
