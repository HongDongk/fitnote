import { Box, Container } from "@mui/material";
import { redirect } from "next/navigation";

import Header from "@/src/app/components/Header/Header";
import { createClient } from "@/src/lib/supabase/server";
import { MemberManagement } from "./components/MemberManagement";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    redirect("/mypage");
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <Header showNavigation />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 6 } }}>
        <MemberManagement instructorId={profile.id} />
      </Container>
    </Box>
  );
}
