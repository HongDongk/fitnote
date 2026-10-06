import {
  Avatar,
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

import { LogoutButton } from "./components/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, slug, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", bgcolor: "background.default" }}
    >
      <Box
        sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 2 }}
      >
        <Container maxWidth="md">
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              핏노트
            </Typography>
            <LogoutButton />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography component="h1" variant="h4">
              반가워요, {profile?.display_name ?? "강사"}님
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              핏노트 운영을 위한 기본 계정이 준비되었습니다.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 3, alignItems: "center" }}
            >
              <Avatar
                src={profile?.avatar_url ?? undefined}
                sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
              >
                {profile?.display_name?.slice(0, 1) ?? "강"}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>
                  강사 프로필
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  회원에게 공개될 기본 정보입니다.
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack component="dl" spacing={2.5} sx={{ mt: 3, m: 0 }}>
              <Box>
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                >
                  표시 이름
                </Typography>
                <Typography
                  component="dd"
                  sx={{ m: 0, mt: 0.5, fontWeight: 700 }}
                >
                  {profile?.display_name ?? "프로필 없음"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                >
                  공개 주소
                </Typography>
                <Typography
                  component="dd"
                  sx={{
                    m: 0,
                    mt: 0.5,
                    fontWeight: 700,
                    wordBreak: "break-all",
                  }}
                >
                  /{profile?.slug ?? "프로필 없음"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                >
                  사용자 ID
                </Typography>
                <Typography
                  component="dd"
                  variant="body2"
                  color="text.secondary"
                  sx={{ m: 0, mt: 0.5, wordBreak: "break-all" }}
                >
                  {user.id}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
