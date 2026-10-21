import type { Metadata } from "next";

import { siteDescription, siteName, siteUrl, toJsonLd } from "@/src/lib/site";
import { createClient } from "@/src/lib/supabase/server";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import FolderOffRoundedIcon from "@mui/icons-material/FolderOffRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Footer from "./components/Footer";
import Header from "./components/Header/Header";

const painPoints = [
  {
    icon: ForumRoundedIcon,
    title: "카톡으로 시간 맞추다 하루가 가요",
    description:
      "회원마다 가능한 시간을 묻고, 답을 기다리고, 다시 조율하는 메시지가 끝없이 이어져요.",
  },
  {
    icon: FolderOffRoundedIcon,
    title: "일정이 여기저기 흩어져 있어요",
    description:
      "메모장, 휴대폰 캘린더, 엑셀을 오가다 보면 어디가 최신인지 헷갈려요.",
  },
  {
    icon: EventBusyRoundedIcon,
    title: "겹치는 예약이 생길까 불안해요",
    description:
      "같은 시간에 두 명을 잡아 버리는 실수, 한 번쯤 해보셨을 거예요.",
  },
];

const steps = [
  {
    title: "프로필 만들기",
    description:
      "가입하고 사진과 소개를 등록하면 나만의 수업 페이지 주소가 생겨요.",
  },
  {
    title: "회원 등록하고 링크 공유",
    description:
      "회원 이메일을 등록하고, 수업 페이지 링크를 카톡이나 인스타그램으로 보내세요.",
  },
  {
    title: "신청 확인하고 승인",
    description:
      "회원이 빈 시간에 수업을 신청하면, 승인 한 번으로 캘린더에 확정돼요.",
  },
];

const features = [
  {
    icon: LinkRoundedIcon,
    title: "나만의 수업 페이지",
    description:
      "강사 소개와 수업 일정을 한 페이지에 모았어요. 링크 하나로 회원에게 공유하세요.",
  },
  {
    icon: CalendarMonthRoundedIcon,
    title: "한눈에 보는 일정 캘린더",
    description: "캘린더에서 바로 일정을 추가하고, 옮기고, 지울 수 있어요.",
  },
  {
    icon: EventAvailableRoundedIcon,
    title: "수업 신청과 승인",
    description:
      "회원은 빈 시간에 신청하고, 강사는 확인 후 승인해요. 이미 일정이 있는 시간은 자동으로 막아요.",
  },
  {
    icon: SyncRoundedIcon,
    title: "실시간 반영",
    description:
      "신청과 일정 변경이 새로고침 없이 강사와 회원 화면에 바로 반영돼요.",
  },
  {
    icon: PeopleOutlineRoundedIcon,
    title: "내 회원만 신청 가능",
    description:
      "등록한 회원만 수업을 신청할 수 있어서, 모르는 사람의 신청을 걱정하지 않아도 돼요.",
  },
  {
    icon: SmartphoneRoundedIcon,
    title: "앱 설치 없이",
    description:
      "휴대폰이나 PC 브라우저에서 바로 써요. 회원은 이메일로 받은 링크로 로그인해요.",
  },
];

const audiences = [
  "PT",
  "필라테스",
  "요가",
  "음악 레슨",
  "댄스",
  "미술",
  "코칭",
];

const upcoming = [
  {
    icon: ConfirmationNumberRoundedIcon,
    title: "수강권·잔여 횟수 관리",
    description: "회원별 남은 수업 횟수를 자동으로 계산해요.",
  },
  {
    icon: NotificationsNoneRoundedIcon,
    title: "신청·수업 알림",
    description: "새 신청과 다가오는 수업을 알림으로 알려드려요.",
  },
  {
    icon: BoltRoundedIcon,
    title: "회원 취소 요청",
    description:
      "확정된 수업도 회원이 직접 취소를 요청할 수 있게 할 예정이에요.",
  },
];

const faqs = [
  {
    question: "핏노트는 무료인가요?",
    answer: "네, 현재 모든 기능을 무료로 이용할 수 있어요.",
  },
  {
    question: "회원도 앱을 설치해야 하나요?",
    answer:
      "아니요. 강사님이 공유한 수업 페이지 링크를 휴대폰이나 PC 브라우저로 열기만 하면 돼요.",
  },
  {
    question: "회원은 어떻게 수업을 신청하나요?",
    answer:
      "강사님이 회원의 이메일을 등록해 두면, 회원은 수업 페이지에서 이메일로 받은 로그인 링크를 눌러 연결한 뒤 캘린더의 빈 시간에 신청할 수 있어요.",
  },
  {
    question: "같은 시간에 예약이 겹치면 어떻게 되나요?",
    answer:
      "이미 일정이 있는 시간에는 신청과 승인이 되지 않아요. 그래서 겹치는 예약이 생기지 않아요.",
  },
  {
    question: "어떤 수업에 쓸 수 있나요?",
    answer:
      "PT, 필라테스, 요가, 음악·댄스 레슨처럼 시간을 정해 1:1이나 소규모로 진행하는 수업이라면 모두 쓸 수 있어요.",
  },
  {
    question: "여러 강사가 함께 쓸 수 있나요?",
    answer:
      "지금은 강사 한 명이 계정 하나로 자신의 수업과 회원을 관리하는 방식이에요.",
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: siteName,
      alternateName: "FitNote",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "ko-KR",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

function SectionHeading({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description?: string;
}) {
  return (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
        {overline}
      </Typography>
      <Typography
        component="h2"
        variant="h4"
        sx={{ mt: 1, fontWeight: 800, wordBreak: "keep-all" }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, lineHeight: 1.8, wordBreak: "keep-all" }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

const previewDays = ["월", "화", "수", "목", "금"];
const previewTimes = ["18:00", "19:00", "20:00"];
// [요일 인덱스, 시간 인덱스, 제목, 승인 대기 여부]
const previewEvents: [number, number, string, boolean][] = [
  [0, 0, "PT", false],
  [1, 1, "필라", false],
  [2, 0, "PT", false],
  [3, 2, "요가", false],
  [4, 1, "신청", true],
];

// 히어로용 예시 화면. 실제 데이터가 아닌 가상의 예시이며 클릭할 수 없다.
function ProductPreview() {
  return (
    <Paper
      elevation={0}
      role="img"
      aria-label="핏노트 예시 화면: 회원의 수업 신청을 승인하면 주간 캘린더에 수업이 확정되는 모습"
      sx={{
        p: { xs: 2.5, sm: 5 },
        bgcolor: "#eaf3ec",
        borderRadius: { xs: "28px", md: 5 },
        border: "1px solid #d8e5dc",
      }}
    >
      <Stack spacing={{ xs: 2, sm: 2.5 }} aria-hidden>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "20px" }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 2 }}
          >
            <Typography sx={{ fontWeight: 800 }}>수업 신청</Typography>
            <Chip label="대기 1" color="primary" size="small" />
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #e2ebe5",
              alignItems: { sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: "50%",
                  bgcolor: "primary.light",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                김
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    김핏노트 회원
                  </Typography>
                  <Chip
                    label="승인 대기"
                    size="small"
                    sx={{ bgcolor: "#fff4e5", color: "#8a5300" }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  금요일 · 19:00 – 20:00
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                승인
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid #d8e5dc",
                  color: "text.secondary",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                거절
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "20px" }}
        >
          <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
            이번 주 일정
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "36px repeat(5, minmax(0, 1fr))",
              gap: 0.75,
              alignItems: "stretch",
            }}
          >
            <Box />
            {previewDays.map((day) => (
              <Typography
                key={day}
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center", fontWeight: 700 }}
              >
                {day}
              </Typography>
            ))}
            {previewTimes.map((time, timeIndex) => [
              <Typography
                key={time}
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: "center" }}
              >
                {time}
              </Typography>,
              ...previewDays.map((day, dayIndex) => {
                const event = previewEvents.find(
                  ([d, t]) => d === dayIndex && t === timeIndex,
                );
                return (
                  <Box
                    key={`${day}-${time}`}
                    sx={{
                      minHeight: 40,
                      minWidth: 0,
                      borderRadius: "8px",
                      px: 0.5,
                      lineHeight: "40px",
                      textAlign: "center",
                      fontSize: { xs: 11, sm: 12 },
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      ...(event
                        ? event[3]
                          ? {
                              border: "1.5px dashed",
                              borderColor: "primary.main",
                              color: "primary.main",
                              bgcolor: "white",
                            }
                          : { bgcolor: "primary.light", color: "primary.dark" }
                        : { bgcolor: "#f5f8f6" }),
                    }}
                  >
                    {event?.[2]}
                  </Box>
                );
              }),
            ])}
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const isLoggedIn = !error && Boolean(user);
  const { data: profile } =
    isLoggedIn && user
      ? await supabase
          .from("profiles")
          .select("slug")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };
  const dashboardHref = profile ? `/${profile.slug}` : "/mypage";
  const startHref = isLoggedIn ? dashboardHref : "/signup";

  return (
    <Box sx={{ bgcolor: "#fbfcfa", color: "text.primary" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <Header />

      <Box component="main">
        {/* 히어로 */}
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 7, md: 11 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1.05fr" },
              gap: { xs: 5, md: 8 },
              alignItems: "center",
            }}
          >
            <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
              <Chip
                label="1인 강사 · 소규모 수업을 위한 핏노트"
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  fontWeight: 700,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 38, sm: 50, md: 56 },
                  fontWeight: 800,
                  lineHeight: 1.22,
                  letterSpacing: "-0.055em",
                  wordBreak: "keep-all",
                }}
              >
                관리에 쓰던 시간,
                <br />
                이제 수업에 쓰세요.
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: 16, sm: 18 },
                  lineHeight: 1.85,
                  maxWidth: 480,
                  wordBreak: "keep-all",
                }}
              >
                링크 하나로 수업 일정을 공개하고, 회원의 수업 신청을 받아
                승인까지. 회원은 앱 설치 없이 바로 신청해요.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  href={startHref}
                  variant="contained"
                  size="large"
                  color="primary"
                  endIcon={<ArrowForwardRoundedIcon />}
                  style={{ color: "#fff" }}
                  sx={{ px: 3 }}
                >
                  {isLoggedIn ? "내 수업 페이지로" : "무료로 시작하기"}
                </Button>
                <Button
                  href="#how-it-works"
                  variant="outlined"
                  size="large"
                  sx={{ px: 3 }}
                >
                  이용 방법 보기
                </Button>
              </Stack>
              <Stack
                direction="row"
                sx={{ flexWrap: "wrap", columnGap: 2.5, rowGap: 1 }}
              >
                {["앱 설치 없음", "실시간 반영", "지금 무료"].map((label) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center" }}
                  >
                    <CheckRoundedIcon
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            <ProductPreview />
          </Box>
        </Container>

        {/* 이런 불편 */}
        <Box
          component="section"
          sx={{
            bgcolor: "white",
            py: { xs: 7, md: 10 },
            borderBlock: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="lg">
            <SectionHeading
              overline="SOUND FAMILIAR?"
              title="이런 불편, 익숙하지 않나요?"
              description="혼자 수업하고 운영까지 하다 보면 정작 수업 준비할 시간이 부족해져요."
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {painPoints.map(({ icon: Icon, title, description }) => (
                <Paper
                  key={title}
                  variant="outlined"
                  sx={{ p: 3.5, bgcolor: "#fbfcfa" }}
                >
                  <Icon sx={{ fontSize: 30, mb: 2, color: "text.secondary" }} />
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 750, mb: 1, wordBreak: "keep-all" }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
                  >
                    {description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* 이용 방법 */}
        <Container
          id="how-it-works"
          component="section"
          maxWidth="lg"
          sx={{ py: { xs: 7, md: 10 }, scrollMarginTop: 80 }}
        >
          <SectionHeading
            overline="HOW IT WORKS"
            title="세 단계면 충분해요"
            description="복잡한 설정 없이, 가입한 날부터 바로 수업 신청을 받을 수 있어요."
          />
          <Box
            component="ol"
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {steps.map(({ title, description }, index) => (
              <Paper
                component="li"
                key={title}
                elevation={0}
                sx={{
                  p: 3.5,
                  bgcolor: "#eaf3ec",
                  border: "1px solid #d8e5dc",
                }}
              >
                <Typography
                  sx={{ color: "primary.main", fontWeight: 800, mb: 1.5 }}
                >
                  STEP {String(index + 1).padStart(2, "0")}
                </Typography>
                <Typography
                  component="h3"
                  variant="h6"
                  sx={{ fontWeight: 750, mb: 1, wordBreak: "keep-all" }}
                >
                  {title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
                >
                  {description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>

        {/* 기능 */}
        <Box
          component="section"
          sx={{
            bgcolor: "white",
            py: { xs: 7, md: 10 },
            borderBlock: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="lg">
            <SectionHeading
              overline="FEATURES"
              title="지금 바로 쓸 수 있는 기능"
              description="작은 스튜디오에 꼭 필요한 만큼만, 복잡하지 않게 담았어요."
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {features.map(({ icon: Icon, title, description }) => (
                <Paper
                  key={title}
                  variant="outlined"
                  sx={{ p: 3.5, bgcolor: "#fbfcfa" }}
                >
                  <Icon color="primary" sx={{ fontSize: 32, mb: 2 }} />
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 750, mb: 1, wordBreak: "keep-all" }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
                  >
                    {description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* 이런 분께 + 준비 중 */}
        <Container
          component="section"
          maxWidth="lg"
          sx={{ py: { xs: 7, md: 10 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 6, md: 8 },
            }}
          >
            <Box>
              <SectionHeading
                overline="FOR YOU"
                title="이런 분께 맞아요"
                description="시간을 정해 1:1이나 소규모로 수업하는 강사라면 누구나."
              />
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}>
                {audiences.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.dark",
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Stack>
              <Stack spacing={1.5}>
                {[
                  "혼자 수업하면서 예약과 회원 관리도 직접 하는 강사",
                  "카톡으로 일정 조율하는 시간을 줄이고 싶은 강사",
                  "비싼 매장 관리 프로그램까지는 필요 없는 소규모 스튜디오",
                ].map((text) => (
                  <Stack
                    key={text}
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <TaskAltRoundedIcon
                      sx={{ fontSize: 22, color: "primary.main", mt: 0.25 }}
                    />
                    <Typography sx={{ lineHeight: 1.7, wordBreak: "keep-all" }}>
                      {text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box>
              <SectionHeading
                overline="COMING SOON"
                title="곧 추가될 기능"
                description="강사님들이 가장 많이 필요로 하는 것부터 준비하고 있어요."
              />
              <Stack spacing={2}>
                {upcoming.map(({ icon: Icon, title, description }) => (
                  <Paper
                    key={title}
                    variant="outlined"
                    sx={{ p: 2.5, bgcolor: "white" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Icon sx={{ fontSize: 28, color: "text.secondary" }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", flexWrap: "wrap" }}
                        >
                          <Typography
                            component="h3"
                            sx={{ fontWeight: 750, wordBreak: "keep-all" }}
                          >
                            {title}
                          </Typography>
                          <Chip label="준비 중" size="small" />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, wordBreak: "keep-all" }}
                        >
                          {description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>

        {/* FAQ */}
        <Box
          component="section"
          sx={{
            bgcolor: "white",
            py: { xs: 7, md: 10 },
            borderBlock: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="md">
            <SectionHeading overline="FAQ" title="자주 묻는 질문" />
            <Stack spacing={2}>
              {faqs.map(({ question, answer }) => (
                <Paper
                  key={question}
                  variant="outlined"
                  sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#fbfcfa" }}
                >
                  <Typography
                    component="h3"
                    sx={{ fontWeight: 750, mb: 1, wordBreak: "keep-all" }}
                  >
                    Q. {question}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
                  >
                    {answer}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* 마지막 CTA */}
        <Container
          component="section"
          maxWidth="lg"
          sx={{ py: { xs: 7, md: 10 } }}
        >
          <Paper
            elevation={0}
            sx={{
              px: { xs: 3, md: 6 },
              py: 5,
              bgcolor: "primary.dark",
              color: "white",
              borderRadius: 4,
            }}
          >
            <Stack
              spacing={2}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
              <Typography
                component="h2"
                variant="h4"
                sx={{ wordBreak: "keep-all" }}
              >
                나만의 수업 페이지, 지금 무료로 만들어 보세요.
              </Typography>
              <Typography sx={{ color: "#d4e5da", wordBreak: "keep-all" }}>
                PT, 필라테스, 음악, 댄스까지. 당신의 수업을 위한 작은 시작.
              </Typography>
              <Button
                href={startHref}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                style={{ color: "#1d4d38" }}
                sx={{
                  mt: 1,
                  bgcolor: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#e7f3ec" },
                }}
              >
                {isLoggedIn ? "시작하기" : "계정 만들기"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
