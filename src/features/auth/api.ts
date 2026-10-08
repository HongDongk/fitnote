import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";
import type { Database } from "@/src/lib/supabase/database.types";
import { getSignupResponseError } from "./errors";

export type LoginValues = { email: string; password: string };
export type SignupValues = LoginValues & { displayName: string };

async function ensureProfile(supabase: SupabaseClient<Database>, user: User) {
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

export async function signIn(values: LoginValues) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(values);
  if (error) {
    throw error;
  }

  const profileError = await ensureProfile(supabase, data.user);
  return { ...data, profileError };
}

export async function signUp({ email, password, displayName }: SignupValues) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { display_name: displayName },
    },
  });
  if (error) {
    throw error;
  }

  const responseError = getSignupResponseError(data);
  if (responseError) {
    throw responseError;
  }

  const profileError = data.session && data.user
    ? await ensureProfile(supabase, data.user)
    : null;
  return { ...data, profileError };
}

export async function signOut() {
  const { error } = await createClient().auth.signOut();
  if (error) {
    throw error;
  }
}
