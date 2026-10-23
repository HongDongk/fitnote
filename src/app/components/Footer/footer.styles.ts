import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 푸터 전용으로만 쓴다.
const grey = {
  body: "#4E5968",
  sub: "#8B95A1",
  bg: "#F9FAFB",
};

export const linkTextColor = {
  feedback: { color: grey.body },
};

export const styles = {
  footer: { bgcolor: grey.bg, py: { xs: 5, md: 6 } },
  content: {
    justifyContent: "space-between",
    alignItems: { sm: "center" },
  },
  title: {
    color: grey.body,
    fontSize: 14,
    fontWeight: 600,
    wordBreak: "keep-all",
  },
  feedback: { color: grey.sub, fontSize: 13, wordBreak: "keep-all" },
  feedbackLink: {
    textDecoration: "underline",
    textUnderlineOffset: 2,
    overflowWrap: "anywhere",
  },
  copyright: { color: grey.sub, fontSize: 13 },
} satisfies Record<string, SxProps<Theme>>;
