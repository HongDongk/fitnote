"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { useLogout } from "@/src/features/auth/hooks";
import { getLogoutErrorMessage } from "@/src/features/auth/errors";

export function LogoutButton() {
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

      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(getLogoutErrorMessage(error));
    } finally {
      isSubmitting.current = false;
    }
  }

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-end" }}>
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
        sx={{
          color: "primary.dark",
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
        {isLoading ? "로그아웃 중" : "로그아웃"}
      </Button>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}
