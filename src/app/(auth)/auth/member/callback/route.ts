import { NextResponse } from "next/server";

import {
  getMemberCallbackError,
  getMemberDatabaseError,
  getMemberValidationError,
  memberMessages,
} from "@/src/features/members/errors";
import { ApiError } from "@/src/lib/api/error";
import {
  memberCallbackSchema,
  memberLinkSchema,
} from "@/src/lib/schemas/memberSchemas";
import { createClient } from "@/src/lib/supabase/server";

const responseHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  Vary: "Accept",
};

export async function GET(request: Request) {
  let authenticated = false;
  const requestUrl = new URL(request.url);
  const slugResult = memberLinkSchema.safeParse({
    instructorSlug: requestUrl.searchParams.get("instructorSlug"),
  });
  const isBrowser = request.headers.get("accept")?.includes("text/html");
  const returnUrl = slugResult.success
    ? new URL(`/${slugResult.data.instructorSlug}`, requestUrl.origin)
    : null;

  try {
    const { searchParams } = requestUrl;
    const result = memberCallbackSchema.safeParse({
      instructorSlug: searchParams.get("instructorSlug"),
      code: searchParams.get("code") ?? undefined,
      tokenHash: searchParams.get("token_hash") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    });

    if (!result.success) {
      throw getMemberValidationError(result.error);
    }

    const supabase = await createClient();
    const { code, tokenHash, instructorSlug } = result.data;
    const { error: authError } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "email",
        });

    if (authError) {
      throw new ApiError(memberMessages.callbackInvalid, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ApiError(memberMessages.callbackInvalid, 401);
    }
    authenticated = true;
    if (!user.email_confirmed_at) {
      throw new ApiError(memberMessages.verificationRequired, 403);
    }

    const { data: memberId, error } = await supabase.rpc(
      "link_member_account",
      {
        instructor_slug: instructorSlug,
      },
    );

    if (error) {
      throw getMemberDatabaseError(error);
    }
    if (!memberId) {
      throw new ApiError(memberMessages.notLinked, 404);
    }

    if (isBrowser && returnUrl) {
      return NextResponse.redirect(returnUrl, {
        status: 303,
        headers: responseHeaders,
      });
    }

    return NextResponse.json(
      { authenticated, memberId },
      { headers: responseHeaders },
    );
  } catch (error) {
    const requestError = getMemberCallbackError(error);
    if (isBrowser && returnUrl) {
      returnUrl.searchParams.set(
        "memberError",
        requestError.status >= 500
          ? "callback"
          : authenticated &&
              requestError.message !== memberMessages.verificationRequired
            ? "link"
            : "auth",
      );
      return NextResponse.redirect(returnUrl, {
        status: 303,
        headers: responseHeaders,
      });
    }
    return NextResponse.json(
      {
        authenticated,
        message: requestError.message,
        fieldErrors: requestError.fieldErrors,
      },
      { status: requestError.status, headers: responseHeaders },
    );
  }
}
