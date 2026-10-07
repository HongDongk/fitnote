import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

import { createClient } from "@/src/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export default async function Header({
  showNavigation = false,
}: {
  showNavigation?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          }}
        >
          <Stack
            component="a"
            href="/"
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
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
            <LogoutButton />
          ) : (
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
          )}
        </Stack>
        {user && showNavigation && (
          <Stack
            component="nav"
            aria-label="주요 메뉴"
            direction="row"
            spacing={1}
            sx={{ pb: 1.5 }}
          >
            <Button href="/dashboard" sx={{ borderRadius: "10px", px: 2 }}>
              대시보드
            </Button>
            <Button href="/mypage" sx={{ borderRadius: "10px", px: 2 }}>
              마이페이지
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
