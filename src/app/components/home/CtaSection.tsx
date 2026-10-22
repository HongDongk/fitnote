import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { buttonTextColor, styles as s } from "./home.styles";

export default function CtaSection({
  startHref,
  isLoggedIn,
}: {
  startHref: string;
  isLoggedIn: boolean;
}) {
  return (
    <Container component="section" maxWidth="lg" sx={s.sectionWhite}>
      <Box sx={s.ctaBox}>
        <Stack spacing={2} sx={s.ctaContent}>
          <Typography component="h2" sx={s.ctaTitle}>
            나만의 수업 페이지,
            <br />
            지금 무료로 만들어 보세요
          </Typography>
          <Typography sx={s.ctaDescription}>
            PT, 필라테스, 음악, 댄스까지. 당신의 수업을 위한 작은 시작.
          </Typography>
          <Button
            href={startHref}
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            style={buttonTextColor.inverse}
            sx={s.ctaButton}
          >
            {isLoggedIn ? "시작하기" : "계정 만들기"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
