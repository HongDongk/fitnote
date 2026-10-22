"use client";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { getLogoutErrorMessage } from "@/src/features/auth/errors";
import { useLogout } from "@/src/features/auth/hooks";

import { styles as s } from "./header.styles";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const logout = useLogout();
  const isLoading = logout.isPending;
  const isSubmitting = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    if (isSubmitting.current) {
      return;
    }
    isSubmitting.current = true;
    setErrorMessage("");
    try {
      await logout.mutateAsync();

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setErrorMessage(getLogoutErrorMessage(error));
    } finally {
      isSubmitting.current = false;
    }
  }

  return (
    <Stack spacing={1} sx={s.logoutWrapper}>
      <Button
        type="button"
        variant="text"
        size="small"
        onClick={signOut}
        disabled={isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <LogoutRoundedIcon />
          )
        }
        sx={s.logoutButton}
      >
        {isLoading ? "로그아웃 중" : "로그아웃"}
      </Button>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}
