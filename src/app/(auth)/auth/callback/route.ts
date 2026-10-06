import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

function getDisplayName(metadata: Record<string, unknown>) {
  const candidates = [
    metadata.name,
    metadata.nickname,
    metadata.full_name,
    metadata.preferred_username,
  ];
  const displayName = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return displayName?.trim().slice(0, 50) ?? "강사";
}

function getAvatarUrl(metadata: Record<string, unknown>) {
  const avatarUrl = metadata.avatar_url ?? metadata.picture;
  return typeof avatarUrl === "string" ? avatarUrl : null;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=auth", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError) {
    return NextResponse.redirect(new URL("/?error=auth", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/?error=auth", requestUrl.origin));
  }

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileReadError) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/?error=profile", requestUrl.origin));
  }

  if (!profile) {
    const slug = `teacher-${user.id.replaceAll("-", "").slice(0, 24)}`;
    const { error: profileCreateError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: getDisplayName(user.user_metadata),
        slug,
        avatar_url: getAvatarUrl(user.user_metadata),
      });

    if (profileCreateError?.code === "23505") {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }
    }

    if (profileCreateError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/?error=profile", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
