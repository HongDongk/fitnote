"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { isAuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { AuthResponseError } from "@/src/features/auth/api";
import { useLogin, useSignup } from "@/src/features/auth/hooks";
import { MessageDialog } from "@/src/app/components/MessageDialog";

import {
  authFormMessages,
  getAuthErrorMessage,
  validateAuthForm,
  type AuthMode,
  type FieldErrors,
  type FieldName,
} from "@/src/lib/schemas/authSchemas";

export function AuthForm({ mode = "sign-in" }: { mode?: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const login = useLogin();
  const signup = useSignup();
  const isLoading = login.isPending || signup.isPending;
  const isSubmitting = useRef(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    if (!verificationEmail) {
      return;
    }

    function checkVerification() {
      router.refresh();
    }

    window.addEventListener("focus", checkVerification);
    return () => window.removeEventListener("focus", checkVerification);
  }, [router, verificationEmail]);

  function clearFieldError(field: FieldName) {
    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
      ...(field === "password" ? { passwordConfirm: undefined } : {}),
    }));
    setMessage("");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) {
      return;
    }

    const form = event.currentTarget;
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    const displayName = String(formData.get("displayName") ?? "").trim();

    const errors = validateAuthForm(mode, {
      displayName,
      email,
      password,
      passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    });
    setFieldErrors(errors);
    const firstInvalidField = (
      ["displayName", "email", "password", "passwordConfirm"] as const
    ).find((field) => errors[field]);
    if (firstInvalidField) {
      form
        .querySelector<HTMLInputElement>(`input[name="${firstInvalidField}"]`)
        ?.focus();
      return;
    }

    isSubmitting.current = true;
    try {
      if (mode === "sign-up") {
        const data = await signup.mutateAsync({
          email,
          password,
          displayName,
        });

        if (!data.session) {
          setVerificationEmail(email);
          return;
        }

        if (data.profileError) {
          setMessage(authFormMessages.signupProfileError);
          return;
        }
      } else {
        const data = await login.mutateAsync({
          email,
          password,
        });

        if (data.profileError) {
          setMessage(authFormMessages.signinProfileError);
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(
        isAuthError(error)
          ? getAuthErrorMessage(error)
          : error instanceof AuthResponseError
            ? error.message
            : authFormMessages.unexpectedError,
      );
    } finally {
      isSubmitting.current = false;
    }
  }

  if (verificationEmail) {
    return (
      <Stack
        spacing={2}
        role="status"
        sx={{ alignItems: "center", textAlign: "center", py: 2 }}
      >
        <EmailOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
          이메일 인증을 완료해주세요
        </Typography>
        <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
          {verificationEmail}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          위 주소로 인증 메일을 보냈습니다.
          <br />
          메일의 인증 링크를 눌러 가입을 완료해주세요.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          메일이 보이지 않으면 스팸함도 확인해주세요.
          <br />
          가입한 브라우저에서 인증 링크를 열어주세요.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="section">
      <Stack
        component="form"
        noValidate
        spacing={1}
        onSubmit={handleSubmit}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 56,
          },
          "& .MuiFormHelperText-root": {
            minHeight: 23,
            lineHeight: "20px",
          },
        }}
      >
        {mode === "sign-up" && (
          <TextField
            name="displayName"
            label="이름"
            placeholder="홍길동"
            required
            autoComplete="name"
            disabled={isLoading}
            error={Boolean(fieldErrors.displayName)}
            helperText={fieldErrors.displayName || " "}
            onChange={() => clearFieldError("displayName")}
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
          disabled={isLoading}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email || " "}
          onChange={() => clearFieldError("email")}
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
          autoComplete={
            mode === "sign-up" ? "new-password" : "current-password"
          }
          disabled={isLoading}
          error={Boolean(fieldErrors.password)}
          onChange={() => clearFieldError("password")}
          helperText={
            fieldErrors.password ||
            (mode === "sign-up" ? "6자 이상 입력해주세요." : " ")
          }
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
        {mode === "sign-up" && (
          <TextField
            name="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            required
            autoComplete="new-password"
            disabled={isLoading}
            error={Boolean(fieldErrors.passwordConfirm)}
            helperText={fieldErrors.passwordConfirm || " "}
            onChange={() => clearFieldError("passwordConfirm")}
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
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? "처리 중" : undefined}
          sx={{ mt: 1, py: 1.5, borderRadius: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={22} color="inherit" aria-hidden="true" />
          ) : mode === "sign-up" ? (
            "회원가입"
          ) : (
            "로그인"
          )}
        </Button>
      </Stack>
      <MessageDialog
        open={Boolean(message)}
        onClose={() => setMessage("")}
        title={
          mode === "sign-up"
            ? "회원가입을 완료하지 못했어요"
            : "로그인에 실패했어요"
        }
        message={message}
      />
    </Box>
  );
}
