"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setIsLoading(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage("로그아웃에 실패했습니다.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={signOut} disabled={isLoading}>
        {isLoading ? "로그아웃 중..." : "로그아웃"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </>
  );
}
