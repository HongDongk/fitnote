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
                다시 만나서 반가워요 :)
              </Typography>
              <Typography sx={s.description}>
                Google 계정이나 이메일로 로그인하세요.
              </Typography>
            </Stack>

            <AuthForm mode="sign-in" />

            <Typography sx={s.switchText}>
              아직 회원이 아니신가요?{" "}
              <Link
                href="/signup"
                style={linkTextColor.primary}
                sx={s.switchLink}
              >
                회원가입
              </Link>
            </Typography>

            {error === "auth" && (
              <Typography color="error" role="alert" sx={s.errorText}>
                인증에 실패했습니다. 다시 시도해주세요.
              </Typography>
            )}
            {error === "profile" && (
              <Typography color="error" role="alert" sx={s.errorText}>
                프로필 생성에 실패했습니다.
              </Typography>
            )}
          </Stack>
        </Paper>
        <Typography variant="caption" sx={s.footnote}>
          1인 강사와 소규모 스튜디오를 위한 간편한 시작
        </Typography>
      </Container>
    </Box>
  );
}
