"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";

async function ensureProfile(supabase: SupabaseClient, user: User) {
  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name.trim().slice(0, 50)
      : user.email?.split("@")[0].slice(0, 50) || "강사";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      slug: `teacher-${user.id.replaceAll("-", "").slice(0, 24)}`,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  return error;
}

export function EmailAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const displayName = String(formData.get("displayName") ?? "").trim();
    const supabase = createClient();

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: displayName },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setMessage("인증 메일을 보냈습니다. 메일의 확인 링크를 눌러주세요.");
        setIsLoading(false);
        return;
      }

      const profileError = data.user
        ? await ensureProfile(supabase, data.user)
        : null;

      if (profileError) {
        setMessage("프로필 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      const profileError = await ensureProfile(supabase, data.user);

      if (profileError) {
        setMessage("프로필 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section>
      <div>
        <button type="button" onClick={() => setMode("sign-in")}>
          로그인
        </button>
        <button type="button" onClick={() => setMode("sign-up")}>
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "sign-up" && (
          <label>
            이름
            <input name="displayName" required maxLength={50} />
          </label>
        )}
        <label>
          이메일
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          비밀번호
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading
            ? "처리 중..."
            : mode === "sign-up"
              ? "회원가입"
              : "로그인"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}
