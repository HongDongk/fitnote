import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

import HeaderNavigation from "@/src/app/components/Header/HeaderNavigation";
import { LogoutButton } from "@/src/app/components/Header/LogoutButton";
import { createClient } from "@/src/lib/supabase/server";

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
    displayName = member?.name;
  }

  return (
    <Box
      component="header"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            py: 2,
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
          }}
        >
          <Stack
            component="a"
            href="/"
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexShrink: 0 }}
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
          {user ? (
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                title={`${displayName || "회원"}님`}
                sx={{
                  alignItems: "center",
                  height: 40,
                  px: 1,
                  bgcolor: "#f3f7f4",
                  border: "1px solid #e2ebe5",
                  borderRadius: "999px",
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    color: "primary.dark",
                    fontWeight: 700,
                    fontSize: 13,
                    maxWidth: { xs: 64, sm: 160 },
                    minWidth: 0,
                  }}
                >
                  {displayName || "회원"} 님
                </Typography>
              </Stack>
              <Box sx={{ flexShrink: 0 }}>
                <LogoutButton redirectTo={logoutRedirectTo} />
              </Box>
            </Stack>
          ) : showLogin ? (
            <Button
              href="/login"
              variant="text"
              size="small"
              style={{ color: "#1d4d38" }}
              sx={{
                px: 2.5,
                minHeight: 40,
                borderRadius: "10px",
                bgcolor: "#e7f3ec",
                fontWeight: 700,
                transition: "background-color 160ms ease",
                "&.Mui-focusVisible": {
                  outline: "2px solid #276749",
                  outlineOffset: 3,
                },
              }}
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
