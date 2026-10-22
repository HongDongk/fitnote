import { Box, Container, Stack, Typography } from "@mui/material";

import { styles as s } from "./footer.styles";

export default function Footer() {
  return (
    <Box component="footer" sx={s.footer}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={s.content}
        >
          <Typography sx={s.title}>
            핏노트 · 수업에 집중하는 더 쉬운 방법
          </Typography>
          <Typography sx={s.copyright}>
            © {new Date().getFullYear()} Fitnote
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
