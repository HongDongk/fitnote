import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { notFound, redirect } from "next/navigation";

import Header from "@/src/app/components/Header/Header";
import { memberLinkSchema } from "@/src/lib/schemas/memberSchemas";
import { createClient } from "@/src/lib/supabase/server";

export default async function InstructorDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = memberLinkSchema.safeParse({ instructorSlug: slug });
  if (!result.success) {
    notFound();
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,display_name,bio,avatar_url")
    .eq("slug", result.data.instructorSlug)
    .maybeSingle();

  if (profileError) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button href={`/${slug}`} color="inherit">
              재시도
            </Button>
          }
        >
          강사 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </Alert>
      </Container>
    );
  }
  if (!profile) {
    notFound();
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  const isInstructor = !authError && user?.id === profile.id;

  if (isInstructor && (!profile.bio?.trim() || !profile.avatar_url?.trim())) {
    redirect("/mypage");
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Header showNavigation={isInstructor} />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: "24px",
              border: "1px solid #e2ebe5",
              background: "linear-gradient(135deg, #f0f7f2 0%, #ffffff 65%)",
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Avatar
                  src={profile.avatar_url || undefined}
                  alt={`${profile.display_name} 프로필`}
                  sx={{
                    width: { xs: 72, sm: 88 },
                    height: { xs: 72, sm: 88 },
                    flexShrink: 0,
                    bgcolor: "primary.light",
                    color: "primary.main",
                    border: "3px solid white",
                  }}
                >
                  {profile.display_name.slice(0, 1)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "primary.main", fontWeight: 700 }}
                  >
                    강사 프로필
                  </Typography>
                  <Typography
                    component="h1"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: 22, sm: 26 },
                      fontWeight: 800,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.display_name} 강사님
                  </Typography>
                </Box>
              </Stack>
              <Typography
                color="text.secondary"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  lineHeight: 1.85,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                {profile.bio || "수업 소개를 준비하고 있습니다."}
              </Typography>
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: "24px",
              border: "1px solid #e2ebe5",
            }}
          >
            <Stack spacing={3}>
              <Typography component="h2" sx={{ fontSize: 22, fontWeight: 800 }}>
                수업 스케줄
              </Typography>
              <Stack
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  textAlign: "center",
                  py: 4,
                  px: 2,
                  bgcolor: "#f3f7f4",
                  borderRadius: 3,
                }}
              >
                <CalendarMonthRoundedIcon
                  sx={{ fontSize: 36, color: "primary.main" }}
                />
                <Typography sx={{ fontWeight: 700 }}>
                  스케줄 기능을 준비하고 있습니다.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "keep-all" }}
                >
                  {isInstructor
                    ? "수업 일정을 등록하고 회원 예약을 관리할 공간입니다."
                    : "강사님의 수업 일정을 확인하고 예약할 공간입니다."}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
