import { isAuthError } from "@supabase/supabase-js";
import type { z } from "zod";

import type { OAuthProvider } from "@/src/features/auth/api";
import { ApiError } from "@/src/lib/api/error";
import {
  memberLinkSchema,
  memberLoginSchema,
  memberCreateSchema,
  memberDeleteSchema,
} from "@/src/lib/schemas/memberSchemas";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/supabase/database.types";
import {
  getMemberAuthRequestError,
  getMemberDatabaseError,
  getMemberCreateDatabaseError,
  getMemberCreateRequestError,
  getMemberDeleteDatabaseError,
  getMemberDeleteRequestError,
  getMemberReadError,
  getMemberRequestError,
  getMemberValidationError,
  memberMessages,
} from "./errors";

export type LinkMemberAccountInput = z.infer<typeof memberLinkSchema>;
export type RequestMemberLoginInput = z.infer<typeof memberLoginSchema>;
export type CreateMemberInput = z.infer<typeof memberCreateSchema>;
export type MemberSummary = Pick<
  Tables<"members">,
  "id" | "name" | "email" | "auth_user_id" | "created_at"
>;

async function verifyInstructor(
  supabase: ReturnType<typeof createClient>,
  instructorId: string,
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError" || (!error && !user)) {
    throw new ApiError(memberMessages.loginRequired, 401);
  }
  if (error || !user) {
    throw new ApiError(memberMessages.authCheckFailed, 500);
  }
  if (user.id !== instructorId) {
    throw new ApiError(memberMessages.forbidden, 403);
  }
}

export async function getInstructorMembers(
  instructorId: string,
): Promise<MemberSummary[]> {
  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("members")
      .select("id,name,email,auth_user_id,created_at")
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      throw new ApiError(memberMessages.readFailed, 500);
    }
    return data ?? [];
  } catch (error) {
    throw getMemberReadError(error);
  }
}

export async function createMember(
  instructorId: string,
  values: CreateMemberInput,
): Promise<MemberSummary> {
  const result = memberCreateSchema.safeParse(values);
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("members")
      .insert({ instructor_id: instructorId, ...result.data })
      .select("id,name,email,auth_user_id,created_at")
      .single();

    if (error) {
      throw getMemberCreateDatabaseError(error);
    }
    if (!data) {
      throw new ApiError(memberMessages.createFailed, 500);
    }
    return data;
  } catch (error) {
    throw getMemberCreateRequestError(error);
  }
}

export async function deleteMember(instructorId: string, memberId: string) {
  const result = memberDeleteSchema.safeParse({ memberId });
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const supabase = createClient();
    await verifyInstructor(supabase, instructorId);

    const { data, error } = await supabase
      .from("members")
      .delete()
      .eq("id", result.data.memberId)
      .eq("instructor_id", instructorId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw getMemberDeleteDatabaseError(error);
    }
    if (!data) {
      throw new ApiError(memberMessages.memberNotFound, 404);
    }
    return data.id;
  } catch (error) {
    throw getMemberDeleteRequestError(error);
  }
}

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

export async function requestMemberOAuthLogin({
  instructorSlug,
  provider,
}: LinkMemberAccountInput & { provider: OAuthProvider }) {
  const result = memberLinkSchema.safeParse({ instructorSlug });
  if (!result.success) {
    throw getMemberValidationError(result.error);
  }

  try {
    const callbackUrl = new URL(
      "/auth/member/callback",
      window.location.origin,
    );
    callbackUrl.searchParams.set("instructorSlug", result.data.instructorSlug);

    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw isAuthError(error)
      ? getMemberAuthRequestError(error)
      : new ApiError(memberMessages.oauthRequestFailed, 500);
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
