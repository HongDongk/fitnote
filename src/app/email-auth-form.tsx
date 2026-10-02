"use client";

import { FormEvent, SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import { createClient } from "@/src/lib/supabase/client";

async function ensureProfile(supabase: SupabaseClient, user: User) {
  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name.trim().slice(0, 50)
      : user.email?.split("@")[0].slice(0, 50) || "강사";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      slug: `teacher-${user.id.replaceAll("-", "").slice(0, 24)}`,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  return error;
}

export function EmailAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleModeChange(
    _event: SyntheticEvent,
    nextMode: "sign-in" | "sign-up",
  ) {
    setMode(nextMode);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const displayName = String(formData.get("displayName") ?? "").trim();
    const supabase = createClient();

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: displayName },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setMessage("인증 메일을 보냈습니다. 메일의 확인 링크를 눌러주세요.");
        setIsLoading(false);
        return;
      }

      const profileError = data.user
        ? await ensureProfile(supabase, data.user)
        : null;

      if (profileError) {
        setMessage("프로필 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      const profileError = await ensureProfile(supabase, data.user);

      if (profileError) {
        setMessage("프로필 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Box component="section">
      <Tabs
        value={mode}
        onChange={handleModeChange}
        aria-label="인증 방식 선택"
        variant="fullWidth"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="sign-in" label="로그인" />
        <Tab value="sign-up" label="회원가입" />
      </Tabs>

      <Stack component="form" spacing={2.25} onSubmit={handleSubmit}>
        {mode === "sign-up" && (
          <TextField
            name="displayName"
            label="이름"
            placeholder="홍길동"
            required
            slotProps={{
              htmlInput: { maxLength: 50 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        <TextField
          name="email"
          label="이메일"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          name="password"
          label="비밀번호"
          type="password"
          required
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          helperText={mode === "sign-up" ? "6자 이상 입력해주세요." : undefined}
          slotProps={{
            htmlInput: { minLength: 6 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? "처리 중" : undefined}
        >
          {isLoading ? (
            <CircularProgress size={22} color="inherit" aria-hidden="true" />
          ) : mode === "sign-up" ? (
            "무료로 시작하기"
          ) : (
            "로그인"
          )}
        </Button>

        {message && (
          <Alert severity={message.startsWith("인증 메일") ? "success" : "error"}>
            {message}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
