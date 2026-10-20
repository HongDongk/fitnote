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
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { EventCalendar } from "@mui/x-scheduler/event-calendar";
import type { SchedulerEvent } from "@mui/x-scheduler/models";
import { ko } from "date-fns/locale";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import type { SaveScheduleInput } from "@/src/features/schedules/api";
import { getScheduleErrorMessage } from "@/src/features/schedules/errors";
import {
  useDeleteSchedule,
  useInstructorSchedules,
  useSaveSchedule,
} from "@/src/features/schedules/hooks";

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
}: {
  today: string;
  instructorId: string;
  canEdit: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const initialDate = getDateParts(new Date(today)).date;
  const schedulesQuery = useInstructorSchedules(instructorId);
  const saveSchedule = useSaveSchedule(instructorId);
  const removeSchedule = useDeleteSchedule(instructorId);
  const events = useMemo<SchedulerEvent[]>(
    () =>
      (schedulesQuery.data ?? []).map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        start: schedule.starts_at,
        end: schedule.ends_at,
        color: schedule.color as SaveScheduleInput["color"],
      })),
    [schedulesQuery.data],
  );
  const [visibleDate, setVisibleDate] = useState(() =>
    getDateTime(initialDate, 12 * 60),
  );
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("week");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [dragRange, setDragRange] = useState<DragRange | null>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const suppressClick = useRef(false);
  const currentView = isMobile ? "day" : view;

  function closeDialog() {
    setSelection(null);
    setDragRange(null);
    setError("");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (!canEdit) return;
    if (event.button !== 0 || event.pointerType === "touch") return;
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
    const startY = event.clientY;
    const anchor = getMinutes(startY);
    let range: DragRange | null = null;

    function handleMove(moveEvent: PointerEvent) {
      if (!range && Math.abs(moveEvent.clientY - startY) < 5) return;
      const current = getMinutes(moveEvent.clientY);
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

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      if (!range) return;
      suppressClick.current = true;
      dialogTrigger.current = column;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setSelection({ id: null, ...range, title: "" });
      setError("");
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function confirmSelection() {
    if (!selection) return;
    if (!selection.title.trim()) {
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
    const color =
      (events.find((item) => item.id === selection.id)?.color as
        | SaveScheduleInput["color"]
        | undefined) ??
      eventColors[Math.floor(Math.random() * eventColors.length)];
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
          setVisibleDate(start);
          closeDialog();
        },
        onError: (saveError) => setError(getScheduleErrorMessage(saveError)),
      },
    );
  }

  function deleteSelection() {
    if (selection?.id == null) return;
    removeSchedule.mutate(String(selection.id), {
      onSuccess: closeDialog,
      onError: (deleteError) => setError(getScheduleErrorMessage(deleteError)),
    });
  }

  const isSaving = saveSchedule.isPending || removeSchedule.isPending;
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
        onClickCapture={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            event.stopPropagation();
          }
        }}
        sx={{
          height: { xs: 640, sm: 720 },
          minWidth: 0,
          overflow: "hidden",
        }}
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
              const nextIds = new Set(nextEvents.map((item) => item.id));
              for (const item of events) {
                if (nextIds.has(item.id)) continue;
                removeSchedule.mutate(String(item.id), {
                  onError: (deleteError) =>
                    setCalendarError(getScheduleErrorMessage(deleteError)),
                });
              }
            }}
            readOnly={!canEdit}
            visibleDate={visibleDate}
            onVisibleDateChange={setVisibleDate}
            view={currentView}
            onViewChange={setView}
            views={isMobile ? ["day"] : ["day", "week", "month"]}
            displayTimezone={timezone}
            dateLocale={ko}
            defaultPreferences={{
              ampm: false,
              isSidePanelOpen: false,
              weekStartsOn: 1,
            }}
            preferencesMenuConfig={false}
            eventCreation={
              canEdit ? { interaction: "click", duration: 30 } : false
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
              if (!canEdit) return;
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
            sx={{
              height: "100%",
              "& .MuiEventCalendar-headerToolbar": { flexWrap: "wrap", gap: 1 },
              "& .MuiEventCalendar-headerToolbarSidePanelToggle, & .MuiEventCalendar-headerToolbarCompactMenuButton, & .MuiEventCalendar-sidePanelCollapse, & .MuiEventCalendar-dayTimeGridAllDayEventsGrid":
                { display: "none" },
              "& .MuiEventCalendar-headerToolbarActions": {
                alignItems: "center",
                gap: 1,
              },
              "& .MuiEventCalendar-headerToolbarDateNavigator": { gap: 1 },
              "& .MuiEventCalendar-headerToolbarPreviousButton, & .MuiEventCalendar-headerToolbarNextButton":
                {
                  width: 40,
                  height: 40,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: "10px",
                  color: "text.primary",
                },
              "& .MuiEventCalendar-headerToolbarTodayButton, & .MuiEventCalendar-headerToolbarCompactTodayButton":
                {
                  height: 40,
                  minHeight: 40,
                  border: 0,
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  boxShadow: "none",
                  transition: "background-color 160ms ease",
                  "&:hover": { bgcolor: "#dceadf" },
                  "&.Mui-focusVisible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 3,
                  },
                },
              "& .MuiEventCalendar-headerToolbarTodayButton": {
                minWidth: 72,
                px: 2,
                borderRadius: "999px",
                fontSize: 13,
                fontWeight: 700,
              },
              "& .MuiEventCalendar-headerToolbarCompactTodayButton": {
                width: 40,
                borderRadius: "12px",
                "& .MuiSvgIcon-root": { fontSize: 20 },
              },
              "& .MuiEventCalendar-headerToolbarLeftElement > p": {
                fontWeight: 800,
                color: "primary.main",
              },
              "& .MuiEventCalendar-timeGridEvent": {
                borderRadius: "8px",
                "--time-grid-event-column-gap": "0px",
              },
              [`& .${timeGridColumnClass}`]: { userSelect: "none" },
            }}
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
          paper: { sx: { m: 2.5, borderRadius: "24px" } },
          backdrop: {
            sx: {
              bgcolor: "rgba(23, 35, 28, 0.35)",
              backdropFilter: "blur(4px)",
            },
          },
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
          <DialogTitle
            id="schedule-selection-title"
            sx={{ fontSize: 22, fontWeight: 800, px: 3, pt: 3 }}
          >
            {selection?.id == null ? "수업 등록" : "수업 수정"}
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            {selection && (
              <Stack
                spacing={2.5}
                sx={{
                  pt: 1,
                  "& .MuiInputBase-root": { minHeight: 56 },
                }}
              >
                <TextField
                  label="수업 이름"
                  value={selection.title}
                  required
                  slotProps={{ htmlInput: { maxLength: 80 } }}
                  onChange={(event) => {
                    setSelection({ ...selection, title: event.target.value });
                    setError("");
                  }}
                />
                <TextField
                  label="날짜"
                  type="date"
                  value={selection.date}
                  required
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
          <DialogActions sx={{ p: 3 }}>
            {selection?.id != null && (
              <Button
                variant="outlined"
                color="error"
                onClick={deleteSelection}
                disabled={isSaving}
                fullWidth
              >
                삭제
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={closeDialog}
              disabled={isSaving}
              fullWidth
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              fullWidth
            >
              {selection?.id == null ? "수업 등록" : "저장"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
