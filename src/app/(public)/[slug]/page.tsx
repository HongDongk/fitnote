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
import { MemberAccess } from "./components/MemberAccess";
import { ScheduleCalendar } from "./components/ScheduleCalendar";

export default async function InstructorDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ memberError?: string | string[] }>;
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
  const isLoggedIn = !authError && Boolean(user);
  const { memberError } = await searchParams;
  const authUnavailable =
    authError && authError.name !== "AuthSessionMissingError";

  if (isInstructor && (!profile.bio?.trim() || !profile.avatar_url?.trim())) {
    redirect("/mypage");
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Header
        showNavigation={isInstructor}
        showLogin={false}
        logoutRedirectTo={`/${slug}`}
        instructorId={profile.id}
      />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 6 } }}>
        <Stack spacing={3}>
          {!isLoggedIn && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "24px",
                border: "1px solid #e2ebe5",
              }}
            >
              {authUnavailable ? (
                <Alert
                  severity="error"
                  action={
                    <Button href={`/${slug}`} color="inherit">
                      재시도
                    </Button>
                  }
                >
                  로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.
                </Alert>
              ) : (
                <MemberAccess
                  instructorSlug={slug}
                  initialError={
                    typeof memberError === "string" ? memberError : undefined
                  }
                />
              )}
            </Paper>
          )}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: "24px",
              border: "1px solid #e2ebe5",
            }}
          >
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: "center",
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: "18px",
                  background: "#f0f7f2",
                }}
              >
                <Avatar
                  src={profile.avatar_url || undefined}
                  alt={`${profile.display_name} 프로필`}
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
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
                    component="h1"
                    sx={{
                      fontSize: { xs: 20, sm: 22 },
                      fontWeight: 800,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.display_name} 강사님
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.7,
                    }}
                  >
                    {profile.bio || "수업 소개를 준비하고 있습니다."}
                  </Typography>
                </Box>
              </Stack>
              <ScheduleCalendar today={new Date().toISOString()} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
