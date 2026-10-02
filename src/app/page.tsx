import Image from "next/image";
import { redirect } from "next/navigation";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

import { createClient } from "@/src/lib/supabase/server";

import { EmailAuthForm } from "./email-auth-form";

type HomeProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect("/dashboard");
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        py: { xs: 3, sm: 6 },
        background:
          "radial-gradient(circle at 50% 0%, #dcefe4 0%, #f4f7f5 42%, #eef2ef 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: { sm: "0 24px 80px rgba(24, 72, 48, 0.12)" },
          }}
        >
          <Stack spacing={4}>
            <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Image src="/images/logo.png" alt="핏노트 로고" width={64} height={64} priority />
              <Typography component="h1" variant="h4">
                핏노트
              </Typography>
              <Typography color="text.secondary">
                수업에만 집중하세요.
                <br />
                회원 관리와 예약은 핏노트가 도와드릴게요.
              </Typography>
            </Stack>

            <EmailAuthForm />

            {error === "auth" && (
              <Typography color="error" role="alert" sx={{ textAlign: "center" }}>
                이메일 인증에 실패했습니다.
              </Typography>
            )}
            {error === "profile" && (
              <Typography color="error" role="alert" sx={{ textAlign: "center" }}>
                프로필 생성에 실패했습니다.
              </Typography>
            )}
          </Stack>
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2.5, display: "block", textAlign: "center" }}
        >
          1인 강사와 소규모 스튜디오를 위한 간편한 시작
        </Typography>
      </Container>
    </Box>
  );
}
