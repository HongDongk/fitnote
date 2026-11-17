"use client";

import { Button, Stack } from "@mui/material";
import { usePathname } from "next/navigation";

import { linkTextColor, styles as s } from "./header.styles";

export default function HeaderNavigation({
  dashboardHref,
}: {
  dashboardHref: string;
}) {
  const pathname = usePathname();
  const navigationItems = [
    { href: dashboardHref, label: "레슨 대시보드" },
    { href: "/members", label: "회원관리" },
    { href: "/mypage", label: "마이페이지" },
  ];

  return (
    <Stack component="nav" aria-label="주요 메뉴" direction="row" sx={s.nav}>
      {navigationItems.map(({ href, label }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Button
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            disableRipple
            style={isActive ? linkTextColor.navActive : linkTextColor.nav}
            sx={[s.navItem, isActive && s.navItemActive]}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
