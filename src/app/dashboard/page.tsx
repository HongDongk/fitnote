import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

import { LogoutButton } from "../logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, slug, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main>
      <h1>로그인 성공</h1>
      <dl>
        <dt>사용자 ID</dt>
        <dd>{user.id}</dd>
        <dt>표시 이름</dt>
        <dd>{profile?.display_name ?? "프로필 없음"}</dd>
        <dt>공개 주소</dt>
        <dd>{profile?.slug ?? "프로필 없음"}</dd>
      </dl>
      <LogoutButton />
    </main>
  );
}
