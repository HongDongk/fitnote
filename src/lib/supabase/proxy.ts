import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  const { data, error: authError } = await supabase.auth.getClaims();
  const pathname = request.nextUrl.pathname;
  const userId = data?.claims.sub;

  if (
    !authError &&
    userId &&
    pathname !== "/" &&
    pathname !== "/mypage" &&
    pathname !== "/auth/callback" &&
    pathname !== "/api" &&
    !pathname.startsWith("/api/")
  ) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("bio, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      !profile.bio?.trim() ||
      !profile.avatar_url?.trim()
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/mypage";
      url.search = "";
      const redirectResponse = NextResponse.redirect(url);

      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      ["cache-control", "expires", "pragma"].forEach((name) => {
        const value = response.headers.get(name);
        if (value) {
          redirectResponse.headers.set(name, value);
        }
      });

      return redirectResponse;
    }
  }

  return response;
}
