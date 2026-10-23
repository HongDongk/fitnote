import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

import HeaderNavigation from "@/src/app/components/Header/HeaderNavigation";
import { LogoutButton } from "@/src/app/components/Header/LogoutButton";
import { getMetadataDisplayName } from "@/src/features/auth/displayName";
import { createClient } from "@/src/lib/supabase/server";

import { linkTextColor, styles as s } from "./header.styles";

export default async function Header({
  showNavigation = false,
  showLogin = true,
  logoutRedirectTo = "/",
  instructorId,
}: {
  showNavigation?: boolean;
  showLogin?: boolean;
  logoutRedirectTo?: string;
  instructorId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("slug, display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  let displayName = profile?.display_name;

  if (user && !displayName) {
    let memberQuery = supabase
      .from("members")
      .select("name")
      .eq("auth_user_id", user.id);

    if (instructorId) {
      memberQuery = memberQuery.eq("instructor_id", instructorId);
    }

    const { data: member } = await memberQuery
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    // 회원 연결 전이면 Google·카카오 계정 이름이라도 보여준다.
    displayName =
      member?.name ?? getMetadataDisplayName(user.user_metadata);
  }

  return (
    <Box component="header" sx={s.header}>
      <Container maxWidth="lg">
        <Stack direction="row" sx={s.bar}>
          <Stack
            component="a"
            href="/"
            direction="row"
            spacing={0.75}
            sx={s.logo}
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={28}
              height={28}
              priority
            />
            <Typography sx={s.logoText}>FitNote</Typography>
          </Stack>
          {user ? (
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={s.userArea}>
              <Typography
                noWrap
                title={`${displayName || "회원"}님`}
                sx={s.userName}
              >
                {displayName || "회원"} 님
              </Typography>
              <Box sx={s.logoutSlot}>
                <LogoutButton redirectTo={logoutRedirectTo} />
              </Box>
            </Stack>
          ) : showLogin ? (
            <Button
              href="/login"
              variant="contained"
              size="small"
              style={linkTextColor.login}
              sx={s.loginButton}
            >
              로그인
            </Button>
          ) : null}
        </Stack>
        {profile && showNavigation && (
          <HeaderNavigation dashboardHref={`/${profile.slug}`} />
        )}
      </Container>
    </Box>
  );
}
