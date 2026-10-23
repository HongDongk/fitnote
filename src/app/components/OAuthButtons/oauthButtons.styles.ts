import type { SxProps, Theme } from "@mui/material";

// 간편 로그인 버튼 전용. 강사 로그인과 회원 로그인에서 함께 쓴다.
const grey = {
  title: "#191F28",
  line: "#E5E8EB",
};

const base = {
  minHeight: 56,
  borderRadius: "16px",
  fontSize: 17,
  fontWeight: 700,
} satisfies SxProps<Theme>;

export const styles = {
  google: {
    ...base,
    borderColor: grey.line,
    color: grey.title,
    "&:hover": { borderColor: grey.line, bgcolor: "transparent" },
  },
  // 카카오 디자인 가이드: 배경 #FEE500, 글자 85% 검정
  kakao: {
    ...base,
    bgcolor: "#FEE500",
    color: "rgba(0, 0, 0, 0.85)",
    boxShadow: "none",
    "&:hover": { bgcolor: "#FEE500", boxShadow: "none" },
  },
} satisfies Record<string, SxProps<Theme>>;
