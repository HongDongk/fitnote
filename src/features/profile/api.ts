import type { z } from "zod";

import { apiRequest } from "@/src/lib/api/client";
import type { profileUpdateSchema } from "@/src/lib/schemas/profileSchemas";
import type { Tables } from "@/src/lib/supabase/database.types";

export type UpdateProfileInput = z.infer<typeof profileUpdateSchema>;
type UpdateProfileResponse = {
  profile: Pick<Tables<"profiles">, "display_name" | "bio" | "avatar_url">;
};

export function updateProfile(values: UpdateProfileInput) {
  return apiRequest<UpdateProfileResponse>("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
