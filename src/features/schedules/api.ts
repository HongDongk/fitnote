import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";
import {
  scheduleIdSchema,
  scheduleSaveSchema,
} from "@/src/lib/schemas/scheduleSchemas";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/supabase/database.types";
import {
  getScheduleDatabaseError,
  getScheduleRequestError,
  getScheduleValidationError,
  scheduleMessages,
} from "./errors";

export type SaveScheduleInput = z.infer<typeof scheduleSaveSchema>;
export type ScheduleSummary = Pick<
  Tables<"schedules">,
  "id" | "title" | "starts_at" | "ends_at" | "color"
>;

const scheduleColumns = "id,title,starts_at,ends_at,color";

async function verifyInstructor(
  supabase: ReturnType<typeof createClient>,
  instructorId: string,
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError" || (!error && !user)) {
    throw new ApiError(scheduleMessages.loginRequired, 401);
  }
  if (error || !user) {
    throw new ApiError(scheduleMessages.authCheckFailed, 500);
  }
  if (user.id !== instructorId) {
    throw new ApiError(scheduleMessages.forbidden, 403);
  }
}

function parseSchedule(values: SaveScheduleInput) {
  const result = scheduleSaveSchema.safeParse(values);
  if (!result.success) {
    throw getScheduleValidationError(result.error);
  }
  const { title, startsAt, endsAt, color } = result.data;
  return { title, starts_at: startsAt, ends_at: endsAt, color };
}

function parseScheduleId(scheduleId: string) {
  const result = scheduleIdSchema.safeParse(scheduleId);
  if (!result.success) {
    throw getScheduleValidationError(result.error);
  }
  return result.data;
}

export async function getInstructorSchedules(
  instructorId: string,
): Promise<ScheduleSummary[]> {
  try {
    const { data, error } = await createClient()
      .from("schedules")
      .select(scheduleColumns)
      .eq("instructor_id", instructorId)
      .order("starts_at", { ascending: true });

    if (error) {
      throw getScheduleDatabaseError(error, scheduleMessages.readFailed);
    }
    return data ?? [];
  } catch (error) {
    throw getScheduleRequestError(error, scheduleMessages.readFailed);
  }
}

export async function createSchedule(
  instructorId: string,
  values: SaveScheduleInput,
): Promise<ScheduleSummary> {
  const schedule = parseSchedule(values);

  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("schedules")
      .insert({ instructor_id: instructorId, ...schedule })
      .select(scheduleColumns)
      .single();

    if (error) {
      throw getScheduleDatabaseError(error, scheduleMessages.saveFailed);
    }
    return data;
  } catch (error) {
    throw getScheduleRequestError(error, scheduleMessages.saveFailed);
  }
}

export async function updateSchedule(
  instructorId: string,
  scheduleId: string,
  values: SaveScheduleInput,
): Promise<ScheduleSummary> {
  const id = parseScheduleId(scheduleId);
  const schedule = parseSchedule(values);

  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("schedules")
      .update(schedule)
      .eq("id", id)
      .eq("instructor_id", instructorId)
      .select(scheduleColumns)
      .maybeSingle();

    if (error) {
      throw getScheduleDatabaseError(error, scheduleMessages.saveFailed);
    }
    if (!data) {
      throw new ApiError(scheduleMessages.notFound, 404);
    }
    return data;
  } catch (error) {
    throw getScheduleRequestError(error, scheduleMessages.saveFailed);
  }
}

export async function deleteSchedule(instructorId: string, scheduleId: string) {
  const id = parseScheduleId(scheduleId);

  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("instructor_id", instructorId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw getScheduleDatabaseError(error, scheduleMessages.deleteFailed);
    }
    if (!data) {
      throw new ApiError(scheduleMessages.notFound, 404);
    }
    return data.id;
  } catch (error) {
    throw getScheduleRequestError(error, scheduleMessages.deleteFailed);
  }
}
