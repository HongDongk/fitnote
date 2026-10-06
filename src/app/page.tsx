import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
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
import Header from "./components/Header";

const features = [
  {
    icon: PeopleOutlineRoundedIcon,
    title: "회원 관리는 한곳에서",
    description:
      "흩어진 회원 정보와 수업 기록을 모아, 잔여 횟수까지 편하게 확인하는 관리 공간을 준비하고 있어요.",
  },
  {
    icon: CalendarMonthRoundedIcon,
    title: "예약은 링크 하나로",
    description:
      "회원이 앱을 설치하지 않고 빈 시간을 확인하고 예약할 수 있도록 만들고 있어요.",
  },
  {
    icon: NotificationsNoneRoundedIcon,
    title: "반복 안내는 자동으로",
    description:
      "수업 리마인드와 취소 정책을 통해 매번 직접 안내하는 부담을 줄이는 것이 목표예요.",
  },
];

export default function HomePage() {
  return (
    <Box sx={{ bgcolor: "#fbfcfa", color: "text.primary" }}>
      <Header />

      <Box component="main">
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 7, md: 11 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
              gap: { xs: 5, md: 8 },
              alignItems: "center",
            }}
          >
            <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
              <Chip
                label="1인 강사 · 소규모 스튜디오를 위한 핏노트"
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  fontWeight: 700,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 38, sm: 50, md: 60 },
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
                  maxWidth: 460,
                  wordBreak: "keep-all",
                }}
              >
                회원 정보부터 수업 예약까지.
                <br />
                혼자 운영해도 든든한 나만의 관리 노트, 핏노트.
              </Typography>
              <Button
                href="/login"
                variant="contained"
                size="large"
                color="primary"
                endIcon={<ArrowForwardRoundedIcon />}
                style={{ color: "#fff" }}
                sx={{ px: 3 }}
              >
                핏노트 시작하기
              </Button>
              <Typography variant="caption" color="text.secondary">
                현재는 계정 생성과 강사 프로필 확인을 이용할 수 있어요.
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 5, sm: 6 },
                bgcolor: "#eaf3ec",
                borderRadius: 5,
                border: "1px solid #d8e5dc",
              }}
            >
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                    가벼워지는 운영의 하루
                  </Typography>
                  <Chip
                    label="서비스 방향"
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Stack>
                {[
                  [
                    "01",
                    "흩어진 회원 정보를 정리하고",
                    "카카오톡과 엑셀 사이를 오가지 않도록",
                  ],
                  [
                    "02",
                    "수업 일정은 한눈에 확인하고",
                    "내 시간과 회원의 시간을 더 쉽게 맞추도록",
                  ],
                  [
                    "03",
                    "회원과 수업에 집중하세요",
                    "반복되는 관리 업무는 더 간단해지도록",
                  ],
                ].map(([number, title, detail]) => (
                  <Paper
                    key={number}
                    elevation={0}
                    sx={{ p: 3, borderRadius: 3 }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 800 }}
                      >
                        {number}
                      </Typography>
                      <Box>
                        <Typography
                          sx={{ fontWeight: 700, wordBreak: "keep-all" }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, wordBreak: "keep-all" }}
                        >
                          {detail}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Container>

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
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 800 }}
            >
              LESS ADMIN, MORE LESSONS
            </Typography>
            <Typography
              component="h2"
              variant="h4"
              sx={{ mt: 1, mb: 2, wordBreak: "keep-all" }}
            >
              작은 스튜디오에 꼭 필요한 만큼.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              복잡한 기능보다 매일의 불편을 해결하는 기능부터 준비합니다.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
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
                    sx={{ fontWeight: 750, mb: 1 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
                  >
                    {description}
                  </Typography>
                  <Chip
                    label="준비 중"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 2.5 }}
                  />
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

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
                나만의 스튜디오, 핏노트와 시작하세요.
              </Typography>
              <Typography sx={{ color: "#d4e5da", wordBreak: "keep-all" }}>
                PT, 필라테스, 음악, 댄스까지. 당신의 수업을 위한 작은 시작.
              </Typography>
              <Button
                href="/login"
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
                계정 만들기
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
