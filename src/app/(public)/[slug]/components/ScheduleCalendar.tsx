"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { EventCalendar } from "@mui/x-scheduler/event-calendar";
import type { SchedulerEvent } from "@mui/x-scheduler/models";
import { ko } from "date-fns/locale";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getBookingErrorMessage } from "@/src/features/bookings/errors";
import { useRequestBooking } from "@/src/features/bookings/hooks";
import type { SaveScheduleInput } from "@/src/features/schedules/api";
import { getScheduleErrorMessage } from "@/src/features/schedules/errors";
import {
  useDeleteSchedule,
  useInstructorSchedules,
  useSaveSchedule,
  useScheduleRealtime,
} from "@/src/features/schedules/hooks";

import { useOpenMemberLogin } from "./MemberLogin";
import { styles as s } from "./slug.styles";

const timezone = "Asia/Seoul";
const timeOptions = Array.from({ length: 49 }, (_, index) => index * 30);
const subscribe = () => () => {};
const dragPreviewId = "drag-preview";
const eventColors: SaveScheduleInput["color"][] = [
  "blue",
  "purple",
  "orange",
  "pink",
  "teal",
  "indigo",
  "amber",
];
const timeGridColumnClass = "MuiEventCalendar-dayTimeGridColumn";
// 터치에서는 스크롤과 구분하기 위해 길게 눌러야 시간 선택이 시작된다.
const longPressDelay = 400;
const touchMoveTolerance = 10;

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function getDateTime(date: string, minutes: number) {
  return new Date(
    new Date(`${date}T00:00:00+09:00`).getTime() + minutes * 60_000,
  );
}

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function getColumnDate(
  visibleDate: string,
  view: "day" | "week",
  columnIndex: number,
) {
  const date = new Date(`${visibleDate}T00:00:00Z`);
  if (view === "week") {
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    date.setUTCDate(date.getUTCDate() + columnIndex);
  }
  return date.toISOString().slice(0, 10);
}

type DragRange = { date: string; start: number; end: number };

type Selection = {
  id: SchedulerEvent["id"] | null;
  date: string;
  start: number;
  end: number;
  title: string;
};

export function ScheduleCalendar({
  today,
  instructorId,
  canEdit,
  canRequest = false,
  accountId = null,
}: {
  today: string;
  instructorId: string;
  canEdit: boolean;
  canRequest?: boolean;
  accountId?: string | null;
}) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const initialDate = getDateParts(new Date(today)).date;
  const schedulesQuery = useInstructorSchedules(instructorId);
  useScheduleRealtime(instructorId);
  const saveSchedule = useSaveSchedule(instructorId);
  const removeSchedule = useDeleteSchedule(instructorId);
  const requestBooking = useRequestBooking(instructorId, accountId);
  const openMemberLogin = useOpenMemberLogin();
  const events = useMemo<SchedulerEvent[]>(
    () =>
      (schedulesQuery.data ?? []).map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        start: schedule.starts_at,
        end: schedule.ends_at,
        color: schedule.color as SaveScheduleInput["color"],
        readOnly: !canEdit,
      })),
    [schedulesQuery.data, canEdit],
  );
  const [visibleDate, setVisibleDate] = useState(() =>
    getDateTime(initialDate, 12 * 60),
  );
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("week");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragRange, setDragRange] = useState<DragRange | null>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const suppressClick = useRef(false);
  const touchSelecting = useRef(false);
  const submitting = useRef(false);
  const currentView = view;
  const canSelect = (canEdit || canRequest) && schedulesQuery.isSuccess;
  const isSaving =
    saveSchedule.isPending ||
    removeSchedule.isPending ||
    requestBooking.isPending;

  function closeDialog() {
    if (submitting.current) return;
    setSelection(null);
    setDragRange(null);
    setError("");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (!canSelect || isSaving) return;
    if (event.button !== 0) return;
    if (currentView !== "day" && currentView !== "week") return;
    const target = event.target as HTMLElement;
    if (target.closest('button, [role="button"]')) return;
    const column = target.closest<HTMLElement>(`.${timeGridColumnClass}`);
    if (!column?.parentElement) return;

    const columnIndex = Array.from(column.parentElement.children)
      .filter((element) => element.classList.contains(timeGridColumnClass))
      .indexOf(column);
    const date = getColumnDate(
      getDateParts(visibleDate).date,
      currentView,
      columnIndex,
    );
    const getMinutes = (clientY: number) => {
      const rect = column.getBoundingClientRect();
      return Math.min(
        Math.max(((clientY - rect.top) / rect.height) * 1440, 0),
        1440,
      );
    };
    const startX = event.clientX;
    const startY = event.clientY;
    const anchor = getMinutes(startY);
    let range: DragRange | null = null;

    function updateRange(clientY: number) {
      const current = getMinutes(clientY);
      const start = Math.min(
        Math.floor(Math.min(anchor, current) / 30) * 30,
        1410,
      );
      const end = Math.min(
        Math.max(Math.ceil(Math.max(anchor, current) / 30) * 30, start + 30),
        1440,
      );
      if (range && range.start === start && range.end === end) return;
      range = { date, start, end };
      setDragRange(range);
    }

    function openSelection() {
      if (!range) return;
      suppressClick.current = true;
      dialogTrigger.current = column;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setSelection({ id: null, ...range, title: "" });
      setError("");
    }

    if (event.pointerType === "touch") {
      let isSelecting = false;
      const timer = window.setTimeout(() => {
        isSelecting = true;
        touchSelecting.current = true;
        navigator.vibrate?.(10);
        updateRange(startY);
      }, longPressDelay);

      const cleanUp = () => {
        window.clearTimeout(timer);
        touchSelecting.current = false;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchCancel);
      };
      function handleTouchMove(moveEvent: TouchEvent) {
        const touch = moveEvent.touches[0];
        if (!touch) return;
        if (!isSelecting) {
          // 길게 누르기 전에 움직이면 스크롤로 보고 선택을 취소한다.
          if (
            Math.hypot(touch.clientX - startX, touch.clientY - startY) >
            touchMoveTolerance
          ) {
            cleanUp();
          }
          return;
        }
        moveEvent.preventDefault();
        updateRange(touch.clientY);
      }
      function handleTouchEnd(endEvent: TouchEvent) {
        cleanUp();
        if (!isSelecting) return;
        // 손을 뗄 때 생기는 click이 방금 열린 다이얼로그 버튼을 누르지 않게 막는다.
        endEvent.preventDefault();
        openSelection();
      }
      function handleTouchCancel() {
        cleanUp();
        setDragRange(null);
      }

      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd, { passive: false });
      window.addEventListener("touchcancel", handleTouchCancel);
      return;
    }

    function handleMove(moveEvent: PointerEvent) {
      if (!range && Math.abs(moveEvent.clientY - startY) < 5) return;
      updateRange(moveEvent.clientY);
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      openSelection();
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function confirmSelection() {
    if (!selection || submitting.current || !canSelect) return;
    if (canEdit && !selection.title.trim()) {
      setError("수업 이름을 입력해주세요.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selection.date)) {
      setError("날짜를 선택해주세요.");
      return;
    }
    if (selection.start >= selection.end) {
      setError("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const start = getDateTime(selection.date, selection.start);
    const end = getDateTime(selection.date, selection.end);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      setError("날짜와 시간을 확인해주세요.");
      return;
    }
    if (!canEdit) {
      if (!canRequest) return;
      if (start.getTime() <= Date.now()) {
        setError("현재 시간 이후로 신청해주세요.");
        return;
      }
      if (
        events.some(
          (item) =>
            new Date(String(item.start)) < end &&
            new Date(String(item.end)) > start,
        )
      ) {
        setError("이미 수업이 있는 시간입니다. 다른 시간대를 선택해주세요.");
        return;
      }
      submitting.current = true;
      requestBooking.mutate(
        { startsAt: start.toISOString(), endsAt: end.toISOString() },
        {
          onSuccess: () => {
            submitting.current = false;
            setVisibleDate(start);
            closeDialog();
            setNotice("수업을 신청했어요. 강사님이 확인하면 확정됩니다.");
          },
          onError: (requestError) =>
            setError(getBookingErrorMessage(requestError)),
          onSettled: () => {
            submitting.current = false;
          },
        },
      );
      return;
    }
    const color =
      (events.find((item) => item.id === selection.id)?.color as
        | SaveScheduleInput["color"]
        | undefined) ??
      eventColors[Math.floor(Math.random() * eventColors.length)];
    submitting.current = true;
    saveSchedule.mutate(
      {
        scheduleId: selection.id === null ? null : String(selection.id),
        values: {
          title: selection.title,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          color,
        },
      },
      {
        onSuccess: () => {
          submitting.current = false;
          setVisibleDate(start);
          closeDialog();
        },
        onError: (saveError) => setError(getScheduleErrorMessage(saveError)),
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  }

  function deleteSelection() {
    if (selection?.id == null || !canEdit || submitting.current) return;
    submitting.current = true;
    removeSchedule.mutate(String(selection.id), {
      onSuccess: () => {
        submitting.current = false;
        closeDialog();
      },
      onError: (deleteError) => setError(getScheduleErrorMessage(deleteError)),
      onSettled: () => {
        submitting.current = false;
      },
    });
  }

  const loadError = schedulesQuery.isError
    ? getScheduleErrorMessage(schedulesQuery.error)
    : "";

  return (
    <Stack spacing={2}>
      {(loadError || calendarError) && (
        <Alert
          severity="error"
          onClose={calendarError ? () => setCalendarError("") : undefined}
        >
          {calendarError || loadError}
        </Alert>
      )}
      <Box
        onPointerDown={handlePointerDown}
        onContextMenu={(event) => {
          // 길게 눌러 시간을 고르는 동안 모바일 컨텍스트 메뉴가 뜨지 않게 한다.
          if (touchSelecting.current) event.preventDefault();
        }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            event.stopPropagation();
            return;
          }
          // 로그인 전 방문자가 빈 시간대를 누르면 로그인 모달을 연다.
          if (
            openMemberLogin &&
            !canSelect &&
            (event.target as HTMLElement).closest(`.${timeGridColumnClass}`)
          ) {
            openMemberLogin();
          }
        }}
        sx={s.calendarBox}
      >
        {isClient && !schedulesQuery.isPending ? (
          <EventCalendar
            events={
              dragRange
                ? [
                    ...events,
                    {
                      id: dragPreviewId,
                      title: "",
                      start: getDateTime(
                        dragRange.date,
                        dragRange.start,
                      ).toISOString(),
                      end: getDateTime(
                        dragRange.date,
                        dragRange.end,
                      ).toISOString(),
                      color: "green" as const,
                      readOnly: true,
                    },
                  ]
                : events
            }
            onEventsChange={(nextEvents) => {
              if (!canEdit || isSaving) return;
              const nextIds = new Set(nextEvents.map((item) => item.id));
              for (const item of events) {
                if (nextIds.has(item.id)) continue;
                removeSchedule.mutate(String(item.id), {
                  onError: (deleteError) =>
                    setCalendarError(getScheduleErrorMessage(deleteError)),
                });
              }
            }}
            readOnly={!canSelect}
            visibleDate={visibleDate}
            onVisibleDateChange={setVisibleDate}
            view={currentView}
            onViewChange={setView}
            views={["day", "week", "month"]}
            displayTimezone={timezone}
            dateLocale={ko}
            defaultPreferences={{
              ampm: false,
              isSidePanelOpen: false,
              weekStartsOn: 1,
            }}
            preferencesMenuConfig={false}
            eventCreation={
              canSelect ? { interaction: "click", duration: 30 } : false
            }
            areEventsDraggable={false}
            areEventsResizable={false}
            viewConfig={{
              day: { initialScrollTime: 9 },
              week: { initialScrollTime: 9 },
            }}
            localeText={{
              today: "오늘",
              day: "일",
              week: "주",
              month: "월",
              agenda: "목록",
              allDay: "종일",
              time: "시간",
              days: "일",
              weeks: "주",
              months: "월",
              years: "년",
              openSidePanel: "달력 열기",
              closeSidePanel: "달력 닫기",
              openMenu: "달력 메뉴",
              calendarContentAriaLabel: "수업 시간 선택 캘린더",
              nextTimeSpan: () => "다음 기간",
              previousTimeSpan: () => "이전 기간",
              miniCalendarLabel: "날짜 선택",
              miniCalendarGoToPreviousMonth: "이전 달",
              miniCalendarGoToNextMonth: "다음 달",
              editEvent: "시간 수정",
              deleteEvent: "일정 삭제",
              showEventDetails: "수업 상세",
              editEventButtonAriaLabel: "시간 수정",
              deleteEventButtonAriaLabel: "일정 삭제",
              eventActionsToolbarAriaLabel: "수업 선택 메뉴",
              eventContextMenuAriaLabel: "수업 선택 메뉴",
            }}
            onEventEditingStart={(_, details) => {
              details.cancel();
              if (
                !canSelect ||
                isSaving ||
                (!canEdit && details.reason !== "creation")
              )
                return;
              dialogTrigger.current = details.anchor ?? null;
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              const occurrence = details.occurrence;
              const start = occurrence.displayTimezone.start;
              const end = occurrence.displayTimezone.end;
              const selectedDate = getDateParts(new Date(start.timestamp)).date;
              const startMinutes = occurrence.allDay
                ? 9 * 60
                : Math.floor(start.minutesInDay / 30) * 30;
              const endMinutes =
                start.minutesInDay + (end.timestamp - start.timestamp) / 60_000;
              setSelection({
                id: details.reason === "creation" ? null : occurrence.id,
                date: selectedDate,
                start: startMinutes,
                end:
                  details.reason === "creation" || occurrence.allDay
                    ? Math.min(startMinutes + 30, 1440)
                    : Math.min(
                        Math.max(
                          Math.ceil(endMinutes / 30) * 30,
                          startMinutes + 30,
                        ),
                        1440,
                      ),
                title: details.reason === "creation" ? "" : occurrence.title,
              });
              setError("");
            }}
            sx={s.calendar}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" />
        )}
      </Box>
      <Dialog
        open={Boolean(selection)}
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
        disableRestoreFocus
        slotProps={{
          transition: {
            onExited: () => {
              if (dialogTrigger.current?.isConnected) {
                dialogTrigger.current.focus();
              }
            },
          },
          paper: { sx: s.dialogPaper },
          backdrop: { sx: s.dialogBackdrop },
        }}
        aria-labelledby="schedule-selection-title"
      >
        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            confirmSelection();
          }}
        >
          <DialogTitle id="schedule-selection-title" sx={s.dialogTitle}>
            {!canEdit
              ? "수업 신청"
              : selection?.id == null
                ? "수업 등록"
                : "수업 수정"}
          </DialogTitle>
          <DialogContent sx={s.dialogContent}>
            {selection && (
              <Stack spacing={2.5} sx={s.dialogFields}>
                {canEdit ? (
                  <TextField
                    label="수업 이름"
                    value={selection.title}
                    required
                    disabled={isSaving}
                    slotProps={{ htmlInput: { maxLength: 80 } }}
                    onChange={(event) => {
                      setSelection({ ...selection, title: event.target.value });
                      setError("");
                    }}
                  />
                ) : (
                  <Alert severity="info">
                    선택한 시간은 강사님 승인 후 확정됩니다.
                  </Alert>
                )}
                <TextField
                  label="날짜"
                  type="date"
                  value={selection.date}
                  required
                  disabled={isSaving}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(event) => {
                    setSelection({ ...selection, date: event.target.value });
                    setError("");
                  }}
                />
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    select
                    label="시작 시간"
                    disabled={isSaving}
                    value={selection.start}
                    onChange={(event) => {
                      const start = Number(event.target.value);
                      setSelection({
                        ...selection,
                        start,
                        end: Math.max(selection.end, start + 30),
                      });
                      setError("");
                    }}
                  >
                    {timeOptions
                      .filter((minutes) => minutes < 1440)
                      .map((minutes) => (
                        <MenuItem key={minutes} value={minutes}>
                          {formatTime(minutes)}
                        </MenuItem>
                      ))}
                  </TextField>
                  <TextField
                    select
                    label="종료 시간"
                    disabled={isSaving}
                    value={selection.end}
                    onChange={(event) => {
                      setSelection({
                        ...selection,
                        end: Number(event.target.value),
                      });
                      setError("");
                    }}
                  >
                    {timeOptions
                      .filter((minutes) => minutes > selection.start)
                      .map((minutes) => (
                        <MenuItem key={minutes} value={minutes}>
                          {formatTime(minutes)}
                        </MenuItem>
                      ))}
                  </TextField>
                </Stack>
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            )}
          </DialogContent>
          <DialogActions disableSpacing sx={s.dialogActions}>
            {canEdit && selection?.id != null && (
              <Button
                onClick={deleteSelection}
                disabled={isSaving}
                fullWidth
                sx={s.dialogDelete}
              >
                삭제
              </Button>
            )}
            <Button
              onClick={closeDialog}
              disabled={isSaving}
              fullWidth
              sx={s.dialogCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              fullWidth
              sx={s.dialogButton}
            >
              {isSaving
                ? "처리 중…"
                : !canEdit
                  ? "신청하기"
                  : selection?.id == null
                    ? "수업 등록"
                    : "저장"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotice("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotice("")}
          sx={s.toast}
        >
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
