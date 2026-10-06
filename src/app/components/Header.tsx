import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            py: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack
            component="a"
            href="/"
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={36}
              height={36}
              priority
            />
            <Typography sx={{ fontWeight: 800, fontSize: 21 }}>
              핏노트
            </Typography>
          </Stack>
          <Button
            href="/login"
            variant="text"
            size="small"
            style={{ color: "#1d4d38" }}
            sx={{
              px: 2.5,
              minHeight: 40,
              borderRadius: "10px",
              bgcolor: "#e7f3ec",
              fontWeight: 700,
              transition: "background-color 160ms ease",
              "&:hover": { bgcolor: "#d8eadd" },
              "&.Mui-focusVisible": {
                outline: "2px solid #276749",
                outlineOffset: 3,
              },
            }}
          >
            로그인
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
