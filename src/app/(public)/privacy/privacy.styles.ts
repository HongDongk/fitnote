import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 개인정보처리방침 화면 전용으로만 쓴다.
const grey = {
  title: "#191F28",
  body: "#4E5968",
  sub: "#8B95A1",
  line: "#E5E8EB",
};

const keepAll = { wordBreak: "keep-all" } as const;

export const styles = {
  page: { bgcolor: "white", color: grey.title },
  main: { py: { xs: 5, md: 8 } },
  title: {
    color: grey.title,
    fontSize: { xs: 26, md: 32 },
    fontWeight: 700,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  meta: { mt: 1, color: grey.sub, fontSize: 14 },
  intro: {
    mt: 3,
    pb: 4,
    color: grey.body,
    fontSize: 16,
    lineHeight: 1.7,
    borderBottom: `1px solid ${grey.line}`,
    ...keepAll,
  },
  section: { mt: 4 },
  sectionTitle: {
    color: grey.title,
    fontSize: { xs: 18, md: 20 },
    fontWeight: 700,
    letterSpacing: "-0.02em",
    ...keepAll,
  },
  body: {
    mt: 1.5,
    color: grey.body,
    fontSize: 15,
    lineHeight: 1.7,
    ...keepAll,
  },
  list: {
    mt: 1.5,
    mb: 0,
    pl: 2.5,
    color: grey.body,
    fontSize: 15,
    lineHeight: 1.7,
    overflowWrap: "anywhere",
    ...keepAll,
    "& li + li": { mt: 0.5 },
  },
} satisfies Record<string, SxProps<Theme>>;
