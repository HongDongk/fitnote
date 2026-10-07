import { Alert, Box, Container } from "@mui/material";
import { redirect } from "next/navigation";

import Header from "@/src/app/components/Header";
import { createClient } from "@/src/lib/supabase/server";
import { ProfileCompletionForm } from "./components/ProfileCompletionForm";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, slug, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <Header showNavigation />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ py: { xs: 4, sm: 7 } }}
      >
        {profileError || !profile ? (
          <Alert severity="error">
            내 정보를 불러오지 못했습니다. 페이지를 새로고침해주세요.
          </Alert>
        ) : (
          <ProfileCompletionForm
            userId={user.id}
            displayName={profile.display_name}
            email={user.email ?? ""}
            slug={profile.slug}
            bio={profile.bio}
            avatarUrl={profile.avatar_url}
          />
        )}
      </Container>
    </Box>
  );
}
