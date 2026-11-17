import InstagramIcon from "@mui/icons-material/Instagram";
import { Box, Container, Link, Stack, Typography } from "@mui/material";

import { linkTextColor, styles as s } from "./footer.styles";

const FEEDBACK_EMAIL = "feedback@fitnote.online";
const INSTAGRAM_URL =
  "https://www.instagram.com/fitnote__official?xtok=MW0ycGNjZnlyczVvOQ%3D%3D&utm_source=qr";

export default function Footer() {
  return (
    <Box component="footer" sx={s.footer}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={s.content}
        >
          <Stack spacing={0.5}>
            <Typography sx={s.title}>
              핏노트 · 수업에 집중하는 더 쉬운 방법
            </Typography>
            <Typography sx={s.feedback}>
              피드백·문의{" "}
              <Link
                href={`mailto:${FEEDBACK_EMAIL}`}
                style={linkTextColor.feedback}
                sx={s.feedbackLink}
              >
                {FEEDBACK_EMAIL}
              </Link>
            </Typography>
            <Link
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={linkTextColor.instagram}
              sx={s.instagramLink}
            >
              <InstagramIcon sx={s.instagramIcon} />
              @fitnote__official
            </Link>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={s.meta}>
            <Link
              href="/privacy"
              style={linkTextColor.privacy}
              sx={s.privacyLink}
            >
              개인정보처리방침
            </Link>
            <Typography sx={s.copyright}>
              © {new Date().getFullYear()} Fitnote
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
