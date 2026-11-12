import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 푸터 전용으로만 쓴다.
const grey = {
  body: "#4E5968",
  sub: "#8B95A1",
  bg: "#F9FAFB",
};

export const linkTextColor = {
  feedback: { color: grey.body },
  privacy: { color: grey.body },
  instagram: { color: grey.body },
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
  meta: { alignItems: "center" },
  privacyLink: { fontSize: 13, fontWeight: 600 },
  instagramLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    alignSelf: "flex-start",
    mt: 0.5,
    fontSize: 13,
    fontWeight: 600,
  },
  // 아이콘만 인스타그램 브랜드색으로 표시한다.
  instagramIcon: { fontSize: 18, color: "#E4405F" },
  copyright: { color: grey.sub, fontSize: 13 },
} satisfies Record<string, SxProps<Theme>>;
