import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

import { AuthForm } from "../components/AuthForm";

type LoginProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginProps) {
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
        bgcolor: "#f4f7f5",
      }}
    >
      <Container maxWidth="sm" sx={{ maxWidth: { sm: 480 } }}>
        <Button
          href="/"
          startIcon={<ArrowBackRoundedIcon />}
          style={{ color: "#627068" }}
          sx={{ mb: 2, px: 1, minHeight: 40 }}
        >
          홈으로
        </Button>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            boxShadow: { sm: "0 16px 48px rgba(24, 72, 48, 0.06)" },
          }}
        >
          <Stack spacing={4}>
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 1 }}
              >
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  priority
                />
                <Typography sx={{ fontWeight: 800, fontSize: 21 }}>
                  FitNote
                </Typography>
              </Stack>
              <Typography component="h1" variant="h4">
                다시 만나서 반가워요 :)
              </Typography>
              <Typography color="text.secondary">
                이메일과 비밀번호로 로그인하세요.
              </Typography>
            </Stack>

            <AuthForm mode="sign-in" />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              아직 회원이 아니신가요?{" "}
              <Link
                href="/signup"
                style={{ color: "#276749" }}
                sx={{ ml: 1, fontWeight: 700 }}
              >
                회원가입
              </Link>
            </Typography>

            {error === "auth" && (
              <Typography
                color="error"
                role="alert"
                sx={{ textAlign: "center" }}
              >
                이메일 인증에 실패했습니다.
              </Typography>
            )}
            {error === "profile" && (
              <Typography
                color="error"
                role="alert"
                sx={{ textAlign: "center" }}
              >
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
