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

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
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
                  핏노트
                </Typography>
              </Stack>
              <Typography component="h1" variant="h4">
                핏노트 시작하기
              </Typography>
              <Typography color="text.secondary">
                계정을 만들고 나만의 수업 관리를 시작하세요.
              </Typography>
            </Stack>

            <AuthForm mode="sign-up" />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              이미 회원이신가요?{" "}
              <Link
                href="/login"
                style={{ color: "#276749" }}
                sx={{ ml: 1, fontWeight: 700 }}
              >
                로그인
              </Link>
            </Typography>
          </Stack>
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2.5, display: "block", textAlign: "center" }}
        >
          가입 후 이메일의 인증 링크를 확인해주세요.
        </Typography>
      </Container>
    </Box>
  );
}
