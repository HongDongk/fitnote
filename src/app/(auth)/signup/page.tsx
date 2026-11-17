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
import { linkTextColor, styles as s } from "../components/auth.styles";
import { AuthForm } from "../components/AuthForm";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("slug")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      redirect(`/${profile.slug}`);
    }
  }

  return (
    <Box component="main" sx={s.page}>
      <Container maxWidth="sm" sx={s.container}>
        <Button
          href="/"
          startIcon={<ArrowBackRoundedIcon />}
          style={linkTextColor.back}
          sx={s.backButton}
        >
          홈으로
        </Button>
        <Paper elevation={0} sx={s.card}>
          <Stack spacing={4}>
            <Stack spacing={1} sx={s.intro}>
              <Stack direction="row" spacing={0.75} sx={s.logo}>
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={28}
                  height={28}
                  priority
                />
                <Typography sx={s.logoText}>FitNote</Typography>
              </Stack>
              <Typography component="h1" sx={s.title}>
                핏노트 시작하기
              </Typography>
              <Typography sx={s.description}>
                계정을 만들고 나만의 수업 관리를 시작하세요.
              </Typography>
            </Stack>

            <AuthForm mode="sign-up" />

            <Typography sx={s.switchText}>
              이미 회원이신가요?{" "}
              <Link
                href="/login"
                style={linkTextColor.primary}
                sx={s.switchLink}
              >
                로그인
              </Link>
            </Typography>
          </Stack>
        </Paper>
        <Typography variant="caption" sx={s.footnote}>
          가입 후 이메일의 인증 링크를 확인해주세요.
        </Typography>
      </Container>
    </Box>
  );
}
