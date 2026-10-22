import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 헤더 전용으로만 쓴다.
const grey = {
  title: "#191F28",
  body: "#4E5968",
  sub: "#8B95A1",
  fill: "#F2F4F6",
  line: "#E5E8EB",
};

const focusRing = {
  "&.Mui-focusVisible": {
    outline: "2px solid #276749",
    outlineOffset: 3,
  },
};

const smallButton = {
  minHeight: 36,
  borderRadius: "10px",
  fontSize: 14,
  fontWeight: 600,
  ...focusRing,
} satisfies SxProps<Theme>;

// globals.css의 `a { color: inherit }`가 MUI 레이어 스타일보다 우선하므로
// 링크 버튼의 글자색은 sx가 아닌 style 속성으로 지정한다.
export const linkTextColor = {
  login: { color: "#fff" },
  navActive: { color: grey.title },
  nav: { color: grey.sub },
};

export const styles = {
  // 헤더
  header: {
    position: "sticky",
    top: 0,
    zIndex: "appBar",
    bgcolor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "saturate(180%) blur(16px)",
    borderBottom: `1px solid ${grey.fill}`,
  },
  bar: {
    minHeight: 60,
    alignItems: "center",
    justifyContent: "space-between",
    gap: { xs: 1, sm: 2 },
  },
  logo: { alignItems: "center", flexShrink: 0 },
  logoText: {
    color: grey.title,
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "-0.02em",
  },
  userArea: {
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 0,
  },
  userName: {
    color: grey.body,
    fontWeight: 600,
    fontSize: 14,
    maxWidth: { xs: 72, sm: 160 },
    minWidth: 0,
    px: 1,
  },
  logoutSlot: { flexShrink: 0 },
  loginButton: {
    ...smallButton,
    px: 2,
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  },

  // 로그아웃 버튼
  logoutWrapper: { alignItems: "flex-end" },
  logoutButton: {
    ...smallButton,
    px: 1.5,
    color: grey.body,
    bgcolor: grey.fill,
    transition: "background-color 160ms ease",
    "&:hover": { bgcolor: grey.line },
    "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 18 },
  },

  // 메뉴 탭
  nav: { gap: { xs: 2, sm: 3 }, overflowX: "auto" },
  navItem: {
    minWidth: 0,
    px: 0,
    py: 1.5,
    borderRadius: 0,
    flexShrink: 0,
    position: "relative",
    bgcolor: "transparent",
    fontSize: 15,
    fontWeight: 600,
    "&:hover": { bgcolor: "transparent" },
    "&.Mui-focusVisible": {
      outline: "2px solid #276749",
      outlineOffset: -2,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      borderRadius: "2px",
      bgcolor: grey.title,
      opacity: 0,
      pointerEvents: "none",
    },
  },
  navItemActive: {
    fontWeight: 700,
    "&::after": { opacity: 1 },
  },
} satisfies Record<string, SxProps<Theme>>;
