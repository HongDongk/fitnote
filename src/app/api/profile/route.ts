import { NextResponse } from "next/server";

import { profileUpdateSchema } from "@/src/lib/schemas/profileSchemas";
import { createClient } from "@/src/lib/supabase/server";

export async function PATCH(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다. 다시 로그인해주세요." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "올바른 요청 형식이 아닙니다." },
        { status: 400 },
      );
    }

    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return NextResponse.json(
        { message: "입력한 정보를 확인해주세요.", fieldErrors },
        { status: 400 },
      );
    }

    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json(
        { message: "내 정보를 불러오지 못했습니다. 다시 시도해주세요." },
        { status: 500 },
      );
    }
    if (!profile) {
      return NextResponse.json(
        { message: "프로필이 없습니다. 다시 로그인해주세요." },
        { status: 404 },
      );
    }

    const { displayName, bio, avatarUrl } = result.data;
    const { data: avatarFolder } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(`${user.id}/`);
    const isOwnAvatar =
      avatarUrl.startsWith(avatarFolder.publicUrl) &&
      /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(
        avatarUrl.slice(avatarFolder.publicUrl.length),
      );

    if (avatarUrl !== profile.avatar_url && !isOwnAvatar) {
      return NextResponse.json(
        { message: "본인이 업로드한 프로필 사진만 사용할 수 있습니다." },
        { status: 400 },
      );
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("display_name, bio, avatar_url")
      .maybeSingle();

    if (updateError || !updatedProfile) {
      return NextResponse.json(
        { message: "내 정보를 저장하지 못했습니다. 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch {
    return NextResponse.json(
      { message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
