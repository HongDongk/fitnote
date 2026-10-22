"use client";

import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { MessageDialog } from "@/src/app/components/Dialog/MessageDialog";
import { getBookingErrorMessage } from "@/src/features/bookings/errors";
import {
  useBookingRealtime,
  useBookingRequests,
  useChangeBookingRequest,
} from "@/src/features/bookings/hooks";

import { styles as s } from "./slug.styles";

type BookingRequestsProps = {
  instructorId: string;
  accountId: string | null;
  memberId: string | null;
  isInstructor: boolean;
};

type BookingAction = "approve" | "reject" | "cancel";

const statusLabels: Record<string, string> = {
  pending: "승인 대기",
  approved: "확정",
  rejected: "거절",
  cancelled: "취소",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function BookingRequests(props: BookingRequestsProps) {
  if (!props.accountId || (!props.isInstructor && !props.memberId)) {
    return null;
  }

  return <BookingRequestList {...props} />;
}

function BookingRequestList({
  instructorId,
  accountId,
  memberId,
  isInstructor,
}: BookingRequestsProps) {
  const requests = useBookingRequests(
    instructorId,
    accountId,
    memberId,
    isInstructor,
  );
  const changeRequest = useChangeBookingRequest(instructorId, accountId);
  useBookingRealtime(instructorId, accountId, memberId, isInstructor);
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    const initialTimer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);
  const [confirmation, setConfirmation] = useState<{
    requestId: string;
    action: BookingAction;
  } | null>(null);
  const [notification, setNotification] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const submitting = useRef(false);
  const pendingCount = (requests.data ?? []).filter(
    (request) => request.status === "pending",
  ).length;
  const visibleRequests = (requests.data ?? []).filter(
    (request) => request.status === "pending",
  );

  async function handleChange(requestId: string, action: BookingAction) {
    if (submitting.current) {
      return;
    }

    submitting.current = true;
    try {
      await changeRequest.mutateAsync({ requestId, action });
      setNotification({
        severity: "success",
        message:
          action === "approve"
            ? "수업이 확정되어 달력에 반영되었습니다."
            : action === "reject"
              ? "수업 신청을 거절했습니다."
              : "수업 신청을 취소했습니다.",
      });
    } catch (error) {
      setNotification({
        severity: "error",
        message: getBookingErrorMessage(error),
      });
    } finally {
      setConfirmation(null);
      submitting.current = false;
    }
  }

  return (
    <Paper elevation={0} sx={s.requests}>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" spacing={1} sx={s.requestsHeader}>
            <Typography component="h2" sx={s.requestsTitle}>
              {isInstructor ? "수업 신청" : "내 신청 내역"}
            </Typography>
            {!requests.isPending && !requests.isError && (
              <Chip
                label={`대기 ${pendingCount}`}
                size="small"
                sx={s.countBadge}
              />
            )}
          </Stack>
          <Typography sx={s.sectionDescription}>
            {isInstructor
              ? "회원이 원하는 시간을 확인하고 수업을 확정해주세요."
              : "강사님이 승인하면 달력에 수업이 표시됩니다."}
          </Typography>
        </Box>

        {requests.isPending ? (
          <Stack spacing={1.5} aria-label="수업 신청 불러오는 중">
            <Skeleton variant="rounded" height={96} sx={s.skeleton} />
            <Skeleton variant="rounded" height={96} sx={s.skeleton} />
          </Stack>
        ) : requests.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => requests.refetch()}
              >
                다시 시도
              </Button>
            }
          >
            {getBookingErrorMessage(requests.error)}
          </Alert>
        ) : visibleRequests.length === 0 ? (
          <Stack spacing={1} sx={s.empty}>
            <EventNoteRoundedIcon sx={s.emptyIcon} />
            <Typography sx={s.emptyText}>
              대기 중인 수업 신청이 없어요.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {visibleRequests.map((request) => {
              const startsAt = new Date(request.starts_at);
              const endsAt = new Date(request.ends_at);
              const isPast = startsAt.getTime() <= currentTime;
              const isPending = request.status === "pending";

              return (
                <Box key={request.id} sx={s.requestItem}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={s.requestRow}
                  >
                    <Box sx={s.requestInfo}>
                      <Stack direction="row" spacing={1} sx={s.requestTitleRow}>
                        <Typography sx={s.requestTitle}>
                          {isInstructor
                            ? `${request.member?.name ?? "회원"}님`
                            : dateFormatter.format(startsAt)}
                        </Typography>
                        <Chip
                          label={statusLabels[request.status] ?? request.status}
                          size="small"
                          sx={[
                            s.statusBadge,
                            request.status === "approved"
                              ? s.statusApproved
                              : s.statusDefault,
                          ]}
                        />
                      </Stack>
                      <Typography sx={s.requestTime}>
                        {isInstructor && `${dateFormatter.format(startsAt)} · `}
                        {timeFormatter.format(startsAt)} —{" "}
                        {dateFormatter.format(startsAt) !==
                          dateFormatter.format(endsAt) &&
                          `${dateFormatter.format(endsAt)} `}
                        {timeFormatter.format(endsAt)}
                      </Typography>
                      {isPast && isPending && (
                        <Typography variant="caption" sx={s.requestPastNote}>
                          지난 시간은 승인할 수 없어요.{" "}
                          {isInstructor
                            ? "신청을 거절해주세요."
                            : "신청을 취소해주세요."}
                        </Typography>
                      )}
                    </Box>
                    {isPending && (
                      <Stack direction="row" spacing={1} sx={s.requestActions}>
                        {isInstructor ? (
                          <>
                            <Button
                              disabled={changeRequest.isPending}
                              onClick={() =>
                                setConfirmation({
                                  requestId: request.id,
                                  action: "reject",
                                })
                              }
                              sx={s.requestGreyButton}
                            >
                              거절
                            </Button>
                            <Button
                              variant="contained"
                              disabled={
                                changeRequest.isPending ||
                                !currentTime ||
                                isPast
                              }
                              onClick={() =>
                                handleChange(request.id, "approve")
                              }
                              sx={s.requestButton}
                            >
                              승인
                            </Button>
                          </>
                        ) : (
                          <Button
                            disabled={changeRequest.isPending}
                            onClick={() =>
                              setConfirmation({
                                requestId: request.id,
                                action: "cancel",
                              })
                            }
                            sx={s.requestGreyButton}
                          >
                            신청 취소
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>
      <MessageDialog
        open={Boolean(confirmation)}
        title={
          confirmation?.action === "reject"
            ? "수업 신청을 거절할까요?"
            : "수업 신청을 취소할까요?"
        }
        message={
          confirmation?.action === "reject"
            ? "거절한 신청은 다시 승인할 수 없습니다."
            : "취소 후에는 원하는 시간으로 다시 신청할 수 있어요."
        }
        confirmText={
          confirmation?.action === "reject" ? "거절하기" : "신청 취소하기"
        }
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation)
            void handleChange(confirmation.requestId, confirmation.action);
        }}
        isPending={changeRequest.isPending}
      />
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotification(null);
        }}
      >
        <Alert
          severity={notification?.severity ?? "success"}
          variant="filled"
          onClose={() => setNotification(null)}
          sx={[s.toast, notification?.severity === "error" && s.toastError]}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
