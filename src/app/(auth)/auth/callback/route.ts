import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

function getDisplayName(metadata: Record<string, unknown>) {
  const candidates = [
    metadata.display_name,
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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError) {
    return NextResponse.redirect(
      new URL("/login?error=auth", requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=auth", requestUrl.origin),
    );
  }

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  if (profileReadError) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=profile", requestUrl.origin),
    );
  }

  let profileSlug = profile?.slug;

  if (!profile) {
    const slug = `teacher-${user.id.replaceAll("-", "").slice(0, 24)}`;
    const { error: profileCreateError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: getDisplayName(user.user_metadata),
        slug,
      });

    if (profileCreateError?.code === "23505") {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.redirect(
          new URL(`/${existingProfile.slug}`, requestUrl.origin),
        );
      }
    }

    if (profileCreateError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/login?error=profile", requestUrl.origin),
      );
    }

    profileSlug = slug;
  }

  return NextResponse.redirect(new URL(`/${profileSlug}`, requestUrl.origin));
}
