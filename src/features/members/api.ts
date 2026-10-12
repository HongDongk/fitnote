import type { z } from "zod";

import { ApiError } from "@/src/lib/api/error";
import {
  memberLinkSchema,
  memberLoginSchema,
} from "@/src/lib/schemas/memberSchemas";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/supabase/database.types";
import {
  getMemberAuthRequestError,
  getMemberDatabaseError,
  getMemberReadError,
  getMemberRequestError,
  getMemberValidationError,
  memberMessages,
} from "./errors";

export type LinkMemberAccountInput = z.infer<typeof memberLinkSchema>;
export type RequestMemberLoginInput = z.infer<typeof memberLoginSchema>;

export async function linkMemberAccount(
  values: LinkMemberAccountInput,
): Promise<string> {
  const result = memberLinkSchema.safeParse(values);
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("link_member_account", {
      instructor_slug: result.data.instructorSlug,
    });

    if (error) {
      throw getMemberDatabaseError(error);
    }
    if (!data) {
      throw new ApiError(memberMessages.notLinked, 404);
    }
    return data;
  } catch (error) {
    throw getMemberRequestError(error);
  }
}

export async function requestMemberLogin(values: RequestMemberLoginInput) {
  const result = memberLoginSchema.safeParse(values);
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const callbackUrl = new URL(
      "/auth/member/callback",
      window.location.origin,
    );
    callbackUrl.searchParams.set("instructorSlug", result.data.instructorSlug);

    const { error } = await createClient().auth.signInWithOtp({
      email: result.data.email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw getMemberAuthRequestError(error);
  }
}

export async function getMyMember(
  values: LinkMemberAccountInput,
): Promise<Tables<"members"> | null> {
  const result = memberLinkSchema.safeParse(values);
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (
      authError?.name === "AuthSessionMissingError" ||
      (!authError && !user)
    ) {
      throw new ApiError(memberMessages.loginRequired, 401);
    }
    if (authError || !user) {
      throw new ApiError(memberMessages.readFailed, 500);
    }
    if (!user.email_confirmed_at) {
      throw new ApiError(memberMessages.verificationRequired, 403);
    }

    const { data: instructor, error: instructorError } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", result.data.instructorSlug)
      .maybeSingle();

    if (instructorError) {
      throw new ApiError(memberMessages.readFailed, 500);
    }
    if (!instructor) {
      throw new ApiError(memberMessages.instructorNotFound, 404);
    }

    const { data: member, error } = await supabase
      .from("members")
      .select("id,instructor_id,auth_user_id,name,email,created_at,updated_at")
      .eq("instructor_id", instructor.id)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new ApiError(memberMessages.readFailed, 500);
    }
    return member;
  } catch (error) {
    throw getMemberReadError(error);
  }
}
