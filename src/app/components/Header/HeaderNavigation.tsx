"use client";

import { Button, Stack, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/members", label: "회원관리" },
  { href: "/mypage", label: "마이페이지" },
];

export default function HeaderNavigation() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Stack
      component="nav"
      aria-label="주요 메뉴"
      direction="row"
      sx={{ pb: 1.5, gap: 1, flexWrap: "wrap" }}
    >
      {navigationItems.map(({ href, label }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Button
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            style={{
              color: isActive
                ? theme.palette.primary.main
                : theme.palette.text.secondary,
            }}
            sx={{
              borderRadius: "10px",
              px: { xs: 1.5, sm: 2 },
              position: "relative",
              bgcolor: "transparent",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "action.hover",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: "translateX(-50%)",
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: "primary.main",
                opacity: isActive ? 1 : 0,
                pointerEvents: "none",
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
