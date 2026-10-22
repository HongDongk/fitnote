"use client";

import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState, type SubmitEvent } from "react";

import { MessageDialog } from "@/src/app/components/Dialog/MessageDialog";
import type { MemberSummary } from "@/src/features/members/api";
import { ApiError } from "@/src/lib/api/error";
import { memberCreateSchema } from "@/src/lib/schemas/memberSchemas";

import {
  getMemberManagementErrorMessage,
  getMemberValidationError,
} from "@/src/features/members/errors";
import {
  useCreateMember,
  useDeleteMember,
  useInstructorMembers,
} from "@/src/features/members/hooks";

type MemberManagementProps = {
  instructorId: string;
};

export function MemberManagement({ instructorId }: MemberManagementProps) {
  const members = useInstructorMembers(instructorId);
  const createMember = useCreateMember(instructorId);
  const deleteMember = useDeleteMember(instructorId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");
  const isSubmitting = useRef(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberSummary | null>(
    null,
  );
  const isDeleting = useRef(false);

  async function handleDelete() {
    if (!memberToDelete || isDeleting.current) {
      return;
    }
    isDeleting.current = true;
    try {
      await deleteMember.mutateAsync(memberToDelete.id);
      setNotification("회원이 삭제되었습니다.");
      setMemberToDelete(null);
    } catch (error) {
      setMemberToDelete(null);
      setMessage(getMemberManagementErrorMessage(error));
    } finally {
      isDeleting.current = false;
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) {
      return;
    }

    setNotification("");
    setFieldErrors({});
    const result = memberCreateSchema.safeParse({ name, email });
    if (!result.success) {
      setFieldErrors(getMemberValidationError(result.error).fieldErrors ?? {});
      return;
    }

    isSubmitting.current = true;
    try {
      await createMember.mutateAsync(result.data);
      setName("");
      setEmail("");
      setNotification("회원이 등록되었습니다.");
    } catch (error) {
      if (
        error instanceof ApiError &&
        Object.keys(error.fieldErrors).length > 0
      ) {
        setFieldErrors(error.fieldErrors);
      } else {
        setMessage(getMemberManagementErrorMessage(error));
      }
    } finally {
      isSubmitting.current = false;
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
          회원 관리
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 1, wordBreak: "keep-all" }}
        >
          회원을 등록하고, 내 수업과 연결된 회원을 확인하세요.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "320px minmax(0, 1fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: "24px", border: "1px solid #e2ebe5" }}
        >
          <Stack
            component="form"
            noValidate
            spacing={2}
            onSubmit={handleSubmit}
          >
            <Box>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 750 }}>
                새 회원 등록
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                회원이 인증할 이메일을 입력해주세요.
              </Typography>
            </Box>
            <Stack>
              <TextField
                label="이름"
                name="name"
                required
                fullWidth
                autoComplete="off"
                value={name}
                disabled={createMember.isPending}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name || " "}
                slotProps={{ htmlInput: { maxLength: 50 } }}
                sx={{ "& .MuiInputBase-root": { minHeight: 56 } }}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldErrors((previous) => ({ ...previous, name: "" }));
                }}
              />
              <TextField
                label="이메일"
                name="email"
                type="email"
                required
                fullWidth
                autoComplete="off"
                value={email}
                disabled={createMember.isPending}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || " "}
                slotProps={{ htmlInput: { maxLength: 254 } }}
                sx={{ "& .MuiInputBase-root": { minHeight: 56 } }}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((previous) => ({ ...previous, email: "" }));
                }}
              />
            </Stack>
            <Button
              type="submit"
              variant="contained"
              disabled={createMember.isPending}
              sx={{ minHeight: 50, borderRadius: "14px" }}
            >
              {createMember.isPending ? "등록 중…" : "회원 등록"}
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.8, wordBreak: "keep-all" }}
            >
              등록만으로 메일은 발송되지 않습니다. 회원이 등록된 이메일로
              인증하면 계정이 연결됩니다.
            </Typography>
          </Stack>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: "24px",
            border: "1px solid #e2ebe5",
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 750 }}>
                등록된 회원
              </Typography>
              {members.data && (
                <Chip label={`${members.data.length}명`} size="small" />
              )}
            </Stack>
            {members.isPending ? (
              <Stack
                role="status"
                spacing={1.5}
                sx={{ alignItems: "center", py: 5 }}
              >
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  회원 정보를 불러오는 중입니다.
                </Typography>
              </Stack>
            ) : members.isError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    disabled={members.isFetching}
                    onClick={() => void members.refetch()}
                  >
                    재시도
                  </Button>
                }
              >
                {getMemberManagementErrorMessage(members.error)}
              </Alert>
            ) : members.data?.length ? (
              <Stack
                component="ul"
                spacing={1.5}
                sx={{ m: 0, p: 0, listStyle: "none" }}
              >
                {members.data.map((member) => (
                  <Box
                    component="li"
                    key={member.id}
                    sx={{
                      p: 2,
                      border: "1px solid #e2ebe5",
                      borderRadius: "16px",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "flex-start" }}
                    >
                      <Avatar
                        sx={{ bgcolor: "#eaf3ec", color: "primary.main" }}
                      >
                        {member.name.slice(0, 1)}
                      </Avatar>
                      <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                        >
                          {member.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {member.email}
                        </Typography>
                      </Stack>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={0.5}
                        sx={{ alignItems: "center", flexShrink: 0 }}
                      >
                        <Chip
                          label={member.auth_user_id ? "연결됨" : "인증 대기"}
                          color={member.auth_user_id ? "primary" : "default"}
                          variant="outlined"
                          size="small"
                        />
                        <IconButton
                          aria-label={`${member.name} 회원 삭제`}
                          disabled={deleteMember.isPending}
                          onClick={() => {
                            setNotification("");
                            setMemberToDelete(member);
                          }}
                          sx={{ width: 44, height: 44 }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack
                spacing={1.5}
                sx={{ alignItems: "center", py: 5, textAlign: "center" }}
              >
                <PeopleOutlineRoundedIcon
                  sx={{ fontSize: 40, color: "primary.main" }}
                />
                <Typography sx={{ fontWeight: 700 }}>
                  아직 등록된 회원이 없어요
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "keep-all" }}
                >
                  이름과 이메일로 첫 회원을 등록해보세요.
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
      <MessageDialog
        open={Boolean(message)}
        title="회원 관리 안내"
        message={message}
        onClose={() => setMessage("")}
      />
      <MessageDialog
        open={Boolean(memberToDelete)}
        title="회원을 삭제할까요?"
        message={`${memberToDelete?.name ?? ""} 회원의 정보와 계정 연결이 삭제됩니다. 이 작업은 되돌릴 수 없으며, 회원의 로그인 계정은 유지됩니다.`}
        confirmText={deleteMember.isPending ? "삭제 중…" : "삭제"}
        confirmColor="error"
        isPending={deleteMember.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setMemberToDelete(null)}
      />
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setNotification("");
          }
        }}
        sx={{ width: "calc(100% - 32px)", maxWidth: 420 }}
      >
        <Alert
          severity="success"
          variant="filled"
          role="status"
          onClose={() => setNotification("")}
          sx={{
            width: "100%",
            bgcolor: "primary.main",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(23, 35, 28, 0.16)",
          }}
        >
          {notification}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
