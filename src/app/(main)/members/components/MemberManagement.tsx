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

import { styles as s } from "./members.styles";

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
        <Typography component="h1" sx={s.title}>
          회원 관리
        </Typography>
        <Typography sx={s.description}>
          회원을 등록하고, 내 수업과 연결된 회원을 확인하세요.
        </Typography>
      </Box>
      <Box sx={s.layout}>
        <Paper elevation={0} sx={s.card}>
          <Stack
            component="form"
            noValidate
            spacing={2}
            onSubmit={handleSubmit}
            sx={s.form}
          >
            <Box>
              <Typography component="h2" sx={s.cardTitle}>
                새 회원 등록
              </Typography>
              <Typography sx={s.cardDescription}>
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
              sx={s.submitButton}
            >
              {createMember.isPending ? "등록 중…" : "회원 등록"}
            </Button>
            <Typography sx={s.formNote}>
              등록만으로 메일은 발송되지 않습니다. 회원이 등록된 이메일로
              인증하면 계정이 연결됩니다.
            </Typography>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={s.card}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={s.listHeader}>
              <Typography component="h2" sx={s.cardTitle}>
                등록된 회원
              </Typography>
              {members.data && (
                <Chip
                  label={`${members.data.length}명`}
                  size="small"
                  sx={s.countBadge}
                />
              )}
            </Stack>
            {members.isPending ? (
              <Stack role="status" spacing={1.5} sx={s.status}>
                <CircularProgress size={28} />
                <Typography sx={s.statusText}>
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
              <Stack component="ul" sx={s.memberList}>
                {members.data.map((member) => (
                  <Box component="li" key={member.id} sx={s.memberItem}>
                    <Stack direction="row" spacing={1.5} sx={s.memberRow}>
                      <Avatar sx={s.memberAvatar}>
                        {member.name.slice(0, 1)}
                      </Avatar>
                      <Stack spacing={0.25} sx={s.memberInfo}>
                        <Typography sx={s.memberName}>{member.name}</Typography>
                        <Typography sx={s.memberEmail}>
                          {member.email}
                        </Typography>
                      </Stack>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={0.5}
                        sx={s.memberActions}
                      >
                        <Chip
                          label={member.auth_user_id ? "연결됨" : "인증 대기"}
                          size="small"
                          sx={[
                            s.statusBadge,
                            member.auth_user_id
                              ? s.statusConnected
                              : s.statusPending,
                          ]}
                        />
                        <IconButton
                          aria-label={`${member.name} 회원 삭제`}
                          disabled={deleteMember.isPending}
                          onClick={() => {
                            setNotification("");
                            setMemberToDelete(member);
                          }}
                          sx={s.deleteButton}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack spacing={1.5} sx={s.empty}>
                <Box sx={s.emptyIconBox}>
                  <PeopleOutlineRoundedIcon sx={s.emptyIcon} />
                </Box>
                <Typography sx={s.emptyTitle}>
                  아직 등록된 회원이 없어요
                </Typography>
                <Typography sx={s.emptyDescription}>
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
        sx={s.snackbar}
      >
        <Alert
          severity="success"
          variant="filled"
          role="status"
          onClose={() => setNotification("")}
          sx={s.toast}
        >
          {notification}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
