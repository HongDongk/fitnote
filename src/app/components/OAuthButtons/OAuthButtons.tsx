"use client";

import { Button, CircularProgress, Stack } from "@mui/material";
import Image from "next/image";

import type { OAuthProvider } from "@/src/features/auth/api";

import { styles as s } from "./oauthButtons.styles";

const providers = [
  {
    provider: "kakao",
    label: "카카오로 계속하기",
    icon: "/images/kakao-symbol.svg",
    variant: "contained",
  },
  {
    provider: "google",
    label: "Google로 계속하기",
    icon: "/images/google-g.svg",
    variant: "outlined",
  },
] as const;

type OAuthButtonsProps = {
  redirectingProvider: OAuthProvider | null | undefined;
  disabled: boolean;
  onSelect: (provider: OAuthProvider) => void;
};

export function OAuthButtons({
  redirectingProvider,
  disabled,
  onSelect,
}: OAuthButtonsProps) {
  return (
    <Stack spacing={1.5}>
      {providers.map(({ provider, label, icon, variant }) => {
        const isRedirecting = redirectingProvider === provider;
        return (
          <Button
            key={provider}
            type="button"
            variant={variant}
            size="large"
            fullWidth
            startIcon={
              isRedirecting ? undefined : (
                <Image src={icon} alt="" width={35} height={35} />
              )
            }
            disabled={disabled}
            aria-busy={isRedirecting}
            onClick={() => onSelect(provider)}
            sx={s[provider]}
          >
            {isRedirecting ? (
              <CircularProgress size={22} color="inherit" aria-hidden="true" />
            ) : (
              label
            )}
          </Button>
        );
      })}
    </Stack>
  );
}
