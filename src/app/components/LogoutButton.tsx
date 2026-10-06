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
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMessage("로그아웃에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("로그아웃에 실패했습니다. 인터넷 연결을 확인해주세요.");
    } finally {
      setIsLoading(false);
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
