import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";

import Header from "@/src/app/components/Header";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <Header showNavigation />
      <Container
        component="main"
        maxWidth="md"
        sx={{ py: { xs: 3, sm: 6 } }}
      >
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Typography component="h1" variant="h4">
            대시보드
          </Typography>
          <Typography color="text.secondary">
            프로필 확인과 완성은 마이페이지에서 할 수 있습니다.
          </Typography>
          <Button href="/mypage" variant="outlined">
            마이페이지
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
