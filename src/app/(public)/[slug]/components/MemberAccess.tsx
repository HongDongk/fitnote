"use client";

import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MessageDialog } from "@/src/app/components/Dialog/MessageDialog";
import {
  getMemberCallbackMessage,
  memberMessages,
} from "@/src/features/members/errors";
import { useRequestMemberLogin } from "@/src/features/members/hooks";
import { memberLoginSchema } from "@/src/lib/schemas/memberSchemas";

import { styles as s } from "./slug.styles";

type MemberAccessProps = {
  instructorSlug: string;
  initialError?: string;
};

export function MemberAccess({
  instructorSlug,
  initialError,
}: MemberAccessProps) {
  const router = useRouter();
  const requestLogin = useRequestMemberLogin();
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState(() =>
    getMemberCallbackMessage(initialError),
  );

  useEffect(() => {
    if (!sentEmail) return;
    const refreshSession = () => router.refresh();
    window.addEventListener("focus", refreshSession);
    return () => window.removeEventListener("focus", refreshSession);
  }, [sentEmail, router]);

  async function sendEmail() {
    if (submitting.current) return;
    const result = memberLoginSchema.safeParse({
      instructorSlug,
      email: sentEmail || email,
    });
    if (!result.success) {
      setEmailError(
        result.error.issues.find((issue) => issue.path[0] === "email")
          ?.message ?? memberMessages.invalidInput,
      );
      return;
    }
    submitting.current = true;
    try {
      await requestLogin.mutateAsync(result.data);
      setSentEmail(result.data.email);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : memberMessages.emailRequestFailed,
      );
    } finally {
      submitting.current = false;
    }
  }

  return (
    <>
      {sentEmail ? (
        <Stack spacing={2} sx={s.sent}>
          <Box sx={s.sentIconBox}>
            <MailOutlineRoundedIcon sx={s.sentIcon} />
          </Box>
          <Typography component="h2" sx={s.sectionTitle}>
            이메일 인증을 완료해주세요
          </Typography>
          <Typography sx={s.sentEmail}>{sentEmail}</Typography>
          <Typography sx={s.sectionDescription}>
            메일의 로그인 링크를 눌러주세요. 메일이 보이지 않으면 스팸함도
            확인해주세요.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => router.refresh()}
            sx={s.sentConfirm}
          >
            인증 완료했어요
          </Button>
          <Stack direction="row" spacing={1} sx={s.sentActions}>
            <Button
              onClick={sendEmail}
              disabled={requestLogin.isPending}
              sx={s.textButton}
            >
              {requestLogin.isPending ? "발송 중…" : "메일 다시 보내기"}
            </Button>
            <Button
              onClick={() => {
                setSentEmail("");
                setEmailError("");
              }}
              disabled={requestLogin.isPending}
              sx={s.textButton}
            >
              다른 이메일 사용
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void sendEmail();
          }}
        >
          <Stack spacing={2} sx={s.accessForm}>
            <Box>
              <Typography component="h2" sx={s.sectionTitle}>
                회원 로그인
              </Typography>
              <Typography sx={s.sectionDescription}>
                강사님께 등록한 이메일을 입력해주세요. 비밀번호 없이 메일 링크로
                로그인할 수 있어요.
              </Typography>
            </Box>
            <TextField
              name="email"
              label="이메일"
              type="email"
              autoComplete="email"
              required
              fullWidth
              value={email}
              disabled={requestLogin.isPending}
              error={Boolean(emailError)}
              helperText={emailError || " "}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={requestLogin.isPending}
              sx={s.accessSubmit}
            >
              {requestLogin.isPending ? "메일 발송 중…" : "이메일 인증하기"}
            </Button>
          </Stack>
        </Box>
      )}
      <MessageDialog
        open={Boolean(message)}
        title="회원 로그인 안내"
        message={message}
        onClose={() => setMessage("")}
      />
    </>
  );
}
