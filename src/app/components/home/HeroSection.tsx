import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { buttonTextColor, styles as s } from "./home.styles";
import ProductPreview from "./ProductPreview";

const highlights = ["앱 설치 없음", "실시간 반영", "지금 무료"];

export default function HeroSection({
  startHref,
  isLoggedIn,
}: {
  startHref: string;
  isLoggedIn: boolean;
}) {
  return (
    <Container maxWidth="md" sx={s.hero}>
      <Stack spacing={{ xs: 2.5, md: 3 }} sx={s.heroContent}>
        <Typography sx={s.heroOverline}>
          1인 강사 · 소규모 수업을 위한 핏노트
        </Typography>
        <Typography component="h1" sx={s.heroTitle}>
          관리에 쓰던 시간,
          <br />
          이제 수업에 쓰세요
        </Typography>
        <Typography sx={s.heroDescription}>
          링크 하나로 수업 일정을 공개하고, 회원의 수업 신청을 받아 승인까지.
          회원은 앱 설치 없이 바로 신청해요.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          sx={s.heroActions}
        >
          <Button
            href={startHref}
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            style={buttonTextColor.primary}
            sx={s.ctaPrimary}
          >
            {isLoggedIn ? "내 수업 페이지로" : "무료로 시작하기"}
          </Button>
          <Button
            href="#how-it-works"
            style={buttonTextColor.secondary}
            sx={s.ctaSecondary}
          >
            이용 방법 보기
          </Button>
        </Stack>
        <Stack direction="row" sx={s.heroChecks}>
          {highlights.map((label) => (
            <Stack key={label} direction="row" spacing={0.5} sx={s.heroCheck}>
              <CheckRoundedIcon sx={s.heroCheckIcon} />
              <Typography sx={s.heroCheckLabel}>{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Box sx={s.heroPreview}>
        <ProductPreview />
      </Box>
    </Container>
  );
}
