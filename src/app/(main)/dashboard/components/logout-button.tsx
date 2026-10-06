"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { createClient } from "@/src/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setIsLoading(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage("로그아웃에 실패했습니다.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-end" }}>
      <Button
        type="button"
        color="inherit"
        variant="outlined"
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
        sx={{ borderColor: "rgba(255,255,255,0.55)", minHeight: 40 }}
      >
        {isLoading ? "로그아웃 중" : "로그아웃"}
      </Button>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}
