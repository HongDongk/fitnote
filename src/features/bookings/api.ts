import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";
import {
  bookingChangeSchema,
  bookingIdSchema,
  bookingRequestSchema,
} from "@/src/lib/schemas/bookingSchemas";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/supabase/database.types";
import {
  bookingMessages,
  getBookingDatabaseError,
  getBookingRequestError,
  getBookingValidationError,
} from "./errors";

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type BookingChangeInput = z.infer<typeof bookingChangeSchema>;
export type BookingRequest = Tables<"booking_requests"> & {
  member: { name: string } | null;
};

function parseId(value: string) {
  const result = bookingIdSchema.safeParse(value);
  if (!result.success) throw getBookingValidationError(result.error);
  return result.data;
}

async function verifyAccount(
  supabase: ReturnType<typeof createClient>,
  accountId?: string,
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error?.name === "AuthSessionMissingError" || (!error && !user)) {
    throw new ApiError(bookingMessages.loginRequired, 401);
  }
  if (error || !user) {
    throw new ApiError(bookingMessages.authCheckFailed, 500);
  }
  if (accountId && user.id !== accountId) {
    throw new ApiError(bookingMessages.forbidden, 403);
  }
  return user;
}

export async function getBookingRequests(
  instructorId: string,
  accountId: string,
  memberId: string | null,
  isInstructor: boolean,
): Promise<BookingRequest[]> {
  try {
    const supabase = createClient();
    await verifyAccount(supabase, parseId(accountId));
    if (
      (isInstructor && accountId !== instructorId) ||
      (!isInstructor && !memberId)
    ) {
      throw new ApiError(bookingMessages.forbidden, 403);
    }
    let query = supabase
      .from("booking_requests")
      .select(
        "*,member:members!booking_requests_member_id_instructor_id_fkey(name)",
      )
      .eq("instructor_id", parseId(instructorId));
    if (!isInstructor && memberId) {
      query = query.eq("member_id", parseId(memberId));
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw getBookingDatabaseError(error, bookingMessages.readFailed);
    return data ?? [];
  } catch (error) {
    throw getBookingRequestError(error, bookingMessages.readFailed);
  }
}

export async function requestBooking(
  instructorId: string,
  values: BookingRequestInput,
) {
  const parsed = bookingRequestSchema.safeParse(values);
  if (!parsed.success) throw getBookingValidationError(parsed.error);
  const id = parseId(instructorId);
  try {
    const supabase = createClient();
    await verifyAccount(supabase);
    const { data, error } = await supabase.rpc("request_booking", {
      target_instructor_id: id,
      requested_starts_at: parsed.data.startsAt,
      requested_ends_at: parsed.data.endsAt,
    });
    if (error) throw getBookingDatabaseError(error, bookingMessages.saveFailed);
    return data;
  } catch (error) {
    throw getBookingRequestError(error, bookingMessages.saveFailed);
  }
}

export async function changeBookingRequest(values: BookingChangeInput) {
  const parsed = bookingChangeSchema.safeParse(values);
  if (!parsed.success) throw getBookingValidationError(parsed.error);
  const functions = {
    approve: "approve_booking_request",
    reject: "reject_booking_request",
    cancel: "cancel_booking_request",
  } as const;
  try {
    const supabase = createClient();
    await verifyAccount(supabase);
    const { data, error } = await supabase.rpc(functions[parsed.data.action], {
      request_id: parsed.data.requestId,
    });
    if (error) throw getBookingDatabaseError(error, bookingMessages.saveFailed);
    return data;
  } catch (error) {
    throw getBookingRequestError(error, bookingMessages.saveFailed);
  }
}
