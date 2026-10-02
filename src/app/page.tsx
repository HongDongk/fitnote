import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

import { EmailAuthForm } from "./email-auth-form";

type HomeProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>핏노트</h1>
      <p>1인 강사를 위한 회원 관리 서비스</p>
      <EmailAuthForm />
      {error === "auth" && <p>이메일 인증에 실패했습니다.</p>}
      {error === "profile" && <p>프로필 생성에 실패했습니다.</p>}
    </main>
  );
}
