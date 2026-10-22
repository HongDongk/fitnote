import type { SxProps, Theme } from "@mui/material";

// 토스 스타일 그레이 스케일. 홈 화면 전용으로만 쓴다.
export const grey = {
  title: "#191F28",
  body: "#4E5968",
  sub: "#8B95A1",
  bg: "#F9FAFB",
  fill: "#F2F4F6",
  line: "#E5E8EB",
};

// globals.css의 `a { color: inherit }`가 MUI 레이어 스타일보다 우선하므로
// 링크 버튼의 글자색은 sx가 아닌 style 속성으로 지정한다.
export const buttonTextColor = {
  primary: { color: "#fff" },
  secondary: { color: grey.body },
  inverse: { color: "#1d4d38" },
};

const keepAll = { wordBreak: "keep-all" } as const;
const sectionPy = { xs: 10, md: 16 };

const card = {
  p: { xs: 3, md: 4 },
  borderRadius: "24px",
} satisfies SxProps<Theme>;

const cardGrid = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: { xs: 1.5, md: 2 },
} satisfies SxProps<Theme>;

const badge = {
  px: 0.75,
  py: 0.25,
  borderRadius: "6px",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;

const ctaButton = {
  minHeight: 56,
  px: 3.5,
  borderRadius: "16px",
  fontSize: 17,
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
} satisfies SxProps<Theme>;

export const styles = {
  // 페이지 공통
  page: { bgcolor: "white", color: grey.title },
  sectionGrey: { bgcolor: grey.bg, py: sectionPy },
  sectionWhite: { py: sectionPy },

  // 섹션 제목
  heading: { mb: { xs: 5, md: 7 } },
  headingOverline: {
    color: "primary.main",
    fontWeight: 700,
    fontSize: { xs: 15, md: 17 },
  },
  headingTitle: {
    mt: 1.5,
    color: grey.title,
    fontSize: { xs: 28, md: 40 },
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  headingDescription: {
    mt: 2,
    color: grey.body,
    fontSize: { xs: 16, md: 19 },
    lineHeight: 1.6,
    ...keepAll,
  },

  // 아이콘 박스
  iconBox: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
  },
  iconBoxPrimary: { bgcolor: "primary.light", color: "primary.main" },
  iconBoxGrey: { bgcolor: grey.fill, color: grey.sub },
  iconBoxWhite: { bgcolor: "white", color: grey.sub },
  icon: { fontSize: 26 },

  // 카드
  cardGrid,
  cardGridWide: {
    ...cardGrid,
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
    },
  },
  cardWhite: { ...card, bgcolor: "white" },
  cardGrey: { ...card, bgcolor: grey.bg },
  cardTitle: {
    mt: 3,
    mb: 1,
    color: grey.title,
    fontSize: { xs: 18, md: 20 },
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: "-0.02em",
    ...keepAll,
  },
  cardBody: {
    color: grey.body,
    fontSize: { xs: 15, md: 16 },
    lineHeight: 1.65,
    ...keepAll,
  },

  // 히어로
  hero: { pt: { xs: 8, md: 14 }, pb: sectionPy, textAlign: "center" },
  heroContent: { alignItems: "center" },
  heroOverline: {
    color: "primary.main",
    fontWeight: 700,
    fontSize: { xs: 15, md: 18 },
    ...keepAll,
  },
  heroTitle: {
    color: grey.title,
    fontSize: { xs: 36, sm: 48, md: 60 },
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.04em",
    ...keepAll,
  },
  heroDescription: {
    color: grey.body,
    fontSize: { xs: 17, md: 20 },
    lineHeight: 1.6,
    maxWidth: 560,
    ...keepAll,
  },
  heroActions: { pt: 1.5, width: { xs: "100%", sm: "auto" } },
  ctaPrimary: ctaButton,
  ctaSecondary: {
    ...ctaButton,
    bgcolor: grey.fill,
    "&:hover": { bgcolor: grey.line },
  },
  heroChecks: {
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 2.5,
    rowGap: 1,
  },
  heroCheck: { alignItems: "center" },
  heroCheckIcon: { fontSize: 18, color: "primary.main" },
  heroCheckLabel: { fontSize: 15, color: grey.sub },
  heroPreview: { mt: { xs: 7, md: 10 }, maxWidth: 640, mx: "auto" },

  // 이용 방법
  stepsSection: { py: sectionPy, scrollMarginTop: 80 },
  stepList: { ...cardGrid, listStyle: "none", p: 0, m: 0 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    bgcolor: "primary.main",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 15,
  },

  // 이런 분께 + 준비 중
  audienceGrid: {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
    gap: { xs: 10, md: 8 },
  },
  audienceTags: { flexWrap: "wrap", gap: 1, mb: 4 },
  audienceTag: {
    px: 2,
    py: 1,
    borderRadius: "999px",
    bgcolor: grey.fill,
    color: grey.body,
    fontSize: 15,
    fontWeight: 600,
  },
  audienceItem: { alignItems: "flex-start" },
  audienceItemIcon: { fontSize: 22, color: "primary.main", mt: 0.25 },
  audienceItemText: {
    color: grey.title,
    fontSize: { xs: 16, md: 17 },
    lineHeight: 1.6,
    ...keepAll,
  },
  upcomingItem: {
    p: { xs: 2.5, md: 3 },
    bgcolor: grey.bg,
    borderRadius: "20px",
    alignItems: "center",
  },
  upcomingText: { minWidth: 0, flex: 1 },
  upcomingTitleRow: { alignItems: "center", flexWrap: "wrap" },
  upcomingTitle: {
    color: grey.title,
    fontSize: 17,
    fontWeight: 700,
    ...keepAll,
  },
  upcomingBadge: { ...badge, bgcolor: grey.line, color: grey.body },
  upcomingDescription: {
    mt: 0.5,
    color: grey.body,
    fontSize: 15,
    lineHeight: 1.55,
    ...keepAll,
  },

  // FAQ
  faqList: { bgcolor: "white", borderRadius: "24px", px: { xs: 3, md: 4 } },
  faqItem: {
    py: { xs: 3, md: 3.5 },
    "& + &": { borderTop: `1px solid ${grey.fill}` },
  },
  faqQuestion: {
    mb: 1,
    color: grey.title,
    fontSize: { xs: 17, md: 18 },
    fontWeight: 700,
    ...keepAll,
  },
  faqMark: { color: "primary.main", mr: 1 },

  // 마지막 CTA
  ctaBox: {
    px: { xs: 3, md: 6 },
    py: { xs: 7, md: 9 },
    bgcolor: "primary.main",
    color: "white",
    borderRadius: { xs: "28px", md: "36px" },
  },
  ctaContent: { alignItems: "center", textAlign: "center" },
  ctaTitle: {
    fontSize: { xs: 26, md: 36 },
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: "-0.03em",
    ...keepAll,
  },
  ctaDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: { xs: 16, md: 18 },
    ...keepAll,
  },
  ctaButton: {
    ...ctaButton,
    mt: 2,
    bgcolor: "white",
    "&:hover": { bgcolor: "#e7f3ec", boxShadow: "none" },
  },

  // 히어로 예시 화면
  preview: {
    p: { xs: 2, sm: 4 },
    bgcolor: grey.fill,
    borderRadius: { xs: "28px", sm: "36px" },
  },
  previewCard: {
    p: { xs: 2.5, sm: 3 },
    bgcolor: "white",
    borderRadius: "24px",
    textAlign: "left",
  },
  previewCardHeader: { alignItems: "center", mb: 2 },
  previewCardTitle: { fontWeight: 700, color: grey.title, fontSize: 17 },
  previewCountBadge: {
    ...badge,
    px: 1,
    fontSize: 13,
    bgcolor: "primary.light",
    color: "primary.main",
  },
  previewRequest: {
    p: 2,
    borderRadius: "16px",
    bgcolor: grey.bg,
    alignItems: { sm: "center" },
    justifyContent: "space-between",
  },
  previewMember: { alignItems: "center" },
  previewAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: "50%",
    bgcolor: "primary.light",
    color: "primary.main",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
  },
  previewMemberInfo: { minWidth: 0 },
  previewMemberNameRow: { alignItems: "center" },
  previewMemberName: { fontWeight: 700, color: grey.title },
  previewPendingBadge: { ...badge, bgcolor: "#FFF4E5", color: "#B25E00" },
  previewMemberTime: { fontSize: 14, color: grey.sub, mt: 0.25 },
  previewButton: {
    flex: { xs: 1, sm: "none" },
    textAlign: "center",
    px: 2.25,
    py: 1,
    borderRadius: "10px",
    fontSize: 14,
    fontWeight: 700,
  },
  previewApprove: { bgcolor: "primary.main", color: "white" },
  previewReject: { bgcolor: grey.fill, color: grey.body },
  calendar: {
    display: "grid",
    gridTemplateColumns: "36px repeat(5, minmax(0, 1fr))",
    gap: 0.75,
    alignItems: "stretch",
  },
  calendarDay: {
    textAlign: "center",
    fontWeight: 600,
    fontSize: 12,
    color: grey.sub,
  },
  calendarTime: { alignSelf: "center", fontSize: 12, color: grey.sub },
  calendarCell: {
    minHeight: 40,
    minWidth: 0,
    borderRadius: "10px",
    px: 0.5,
    lineHeight: "40px",
    textAlign: "center",
    fontSize: { xs: 11, sm: 13 },
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  calendarCellEmpty: { bgcolor: grey.bg },
  calendarCellBooked: { bgcolor: "primary.main", color: "white" },
  calendarCellPending: {
    border: "1.5px dashed",
    borderColor: "primary.main",
    color: "primary.main",
    bgcolor: "white",
  },
} satisfies Record<string, SxProps<Theme>>;
