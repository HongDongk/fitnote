import type { z } from "zod";

import { ApiError } from "@/src/lib/api/client";
import { profileUpdateSchema } from "@/src/lib/schemas/profileSchemas";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/supabase/database.types";
import {
  getProfileDatabaseError,
  getProfileRequestError,
  getProfileValidationError,
  profileMessages,
} from "./errors";

export type UpdateProfileInput = z.infer<typeof profileUpdateSchema>;
type UpdateProfileResponse = {
  profile: Pick<Tables<"profiles">, "display_name" | "bio" | "avatar_url">;
};

export async function updateProfile(
  values: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  const result = profileUpdateSchema.safeParse(values);

  if (!result.success) {
    throw getProfileValidationError(result.error);
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new ApiError(profileMessages.loginRequired, 401);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        display_name: result.data.displayName,
        bio: result.data.bio,
        avatar_url: result.data.avatarUrl,
      })
      .eq("id", user.id)
      .select("display_name,bio,avatar_url")
      .maybeSingle();

    if (error) {
      throw getProfileDatabaseError(error);
    }

    if (!profile) {
      throw new ApiError(profileMessages.notFound, 404);
    }

    return { profile };
  } catch (error) {
    throw getProfileRequestError(error);
  }
}
