import { Container, Divider, Stack, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Container component="footer" maxWidth="lg" sx={{ pb: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between" }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          핏노트 · 수업에 집중하는 더 쉬운 방법
        </Typography>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Fitnote
        </Typography>
      </Stack>
    </Container>
  );
}
