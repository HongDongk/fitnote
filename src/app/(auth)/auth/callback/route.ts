import { getMetadataDisplayName } from "@/src/features/auth/displayName";
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const avatarExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getOAuthAvatarUrl(metadata: Record<string, unknown>) {
  const candidate = metadata.avatar_url ?? metadata.picture;
  if (typeof candidate !== "string") {
    return null;
  }

  try {
    const url = new URL(candidate);
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".googleusercontent.com")
    ) {
      return url.href.replace(/=s\d+-c$/, "=s400-c");
    }
    // 카카오는 http 주소를 주기도 하므로 https로 바꿔 요청한다.
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.endsWith(".kakaocdn.net")
    ) {
      url.protocol = "https:";
      return url.href;
    }
    return null;
  } catch {
    return null;
  }
}

// Google·카카오 프로필 사진을 내려받아 본인 폴더에 올린다. 실패해도 로그인은 계속한다.
async function saveOAuthAvatar(
  supabase: SupabaseServerClient,
  userId: string,
  metadata: Record<string, unknown>,
) {
  const avatarUrl = getOAuthAvatarUrl(metadata);
  if (!avatarUrl) {
    return;
  }

  try {
    const response = await fetch(avatarUrl, {
      signal: AbortSignal.timeout(5000),
    });
    const contentType = response.headers.get("content-type")?.split(";")[0];
    const extension = contentType ? avatarExtensions[contentType] : undefined;
    if (!response.ok || !contentType || !extension) {
      return;
    }

    const image = await response.arrayBuffer();
    if (image.byteLength === 0 || image.byteLength > MAX_AVATAR_BYTES) {
      return;
    }

    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(path, image, { contentType, upsert: false });
    if (uploadError) {
      return;
    }

    const { data } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(path);
    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);
  } catch {}
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
        display_name: getMetadataDisplayName(user.user_metadata) ?? "강사",
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

    await saveOAuthAvatar(supabase, user.id, user.user_metadata);
    profileSlug = slug;
  }

  return NextResponse.redirect(new URL(`/${profileSlug}`, requestUrl.origin));
}
