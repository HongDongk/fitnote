import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 로그인·회원가입 화면 전용으로만 쓴다.
const grey = {
  title: "#191F28",
  body: "#4E5968",
  sub: "#8B95A1",
  bg: "#F9FAFB",
  line: "#E5E8EB",
  lineHover: "#D1D6DB",
};

const keepAll = { wordBreak: "keep-all" } as const;

// globals.css의 `a { color: inherit }`가 MUI 레이어 스타일보다 우선하므로
// 링크의 글자색은 sx가 아닌 style 속성으로 지정한다.
export const linkTextColor = {
  back: { color: grey.sub },
  primary: { color: "#276749" },
};

export const styles = {
  // 페이지 레이아웃 (login, signup)
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    py: { xs: 3, sm: 6 },
    bgcolor: { xs: "white", sm: grey.bg },
  },
  container: { maxWidth: { sm: 480 } },
  backButton: {
    mb: 2,
    px: 1,
    minHeight: 40,
    borderRadius: "10px",
    fontSize: 15,
    fontWeight: 600,
  },
  card: {
    p: { xs: 0, sm: 5 },
    bgcolor: "white",
    borderRadius: { sm: "24px" },
  },
  intro: { alignItems: "flex-start" },
  logo: { alignItems: "center", mb: 1.5 },
  logoText: {
    color: grey.title,
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "-0.02em",
  },
  title: {
    color: grey.title,
    fontSize: { xs: 26, sm: 28 },
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  description: {
    color: grey.body,
    fontSize: 16,
    lineHeight: 1.6,
    ...keepAll,
  },
  switchText: { color: grey.sub, fontSize: 15, textAlign: "center" },
  switchLink: { ml: 1, fontWeight: 700 },
  errorText: { fontSize: 15, textAlign: "center", ...keepAll },
  footnote: {
    mt: 2.5,
    display: "block",
    color: grey.sub,
    fontSize: 13,
    textAlign: "center",
    ...keepAll,
  },

  // 입력 폼 (AuthForm)
  form: {
    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      borderRadius: "14px",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: grey.line },
      "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
        { borderColor: grey.lineHover },
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: grey.sub },
    "& .MuiFormHelperText-root": {
      minHeight: 23,
      mx: 0.5,
      fontSize: 13,
      lineHeight: "20px",
    },
  },
  googleButton: {
    minHeight: 56,
    borderRadius: "16px",
    borderColor: grey.line,
    color: grey.title,
    fontSize: 17,
    fontWeight: 700,
    "&:hover": { borderColor: grey.lineHover, bgcolor: grey.bg },
  },
  divider: {
    my: 3,
    color: grey.sub,
    fontSize: 14,
    "&::before, &::after": { borderColor: grey.line },
  },
  submitButton: {
    mt: 1,
    minHeight: 56,
    borderRadius: "16px",
    fontSize: 17,
    fontWeight: 700,
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  },

  // 이메일 인증 안내 (AuthForm)
  verification: { alignItems: "center", textAlign: "center", py: 2 },
  verificationIcon: {
    width: 64,
    height: 64,
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    bgcolor: "primary.light",
    color: "primary.main",
  },
  verificationIconSvg: { fontSize: 32 },
  verificationTitle: {
    color: grey.title,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    ...keepAll,
  },
  verificationEmail: {
    color: grey.title,
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  verificationBody: {
    color: grey.body,
    fontSize: 15,
    lineHeight: 1.6,
    ...keepAll,
  },
  verificationNote: {
    color: grey.sub,
    fontSize: 13,
    lineHeight: 1.6,
    ...keepAll,
  },
} satisfies Record<string, SxProps<Theme>>;
