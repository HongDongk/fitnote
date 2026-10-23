"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Dialog, IconButton } from "@mui/material";
import { createContext, useContext, useState, type ReactNode } from "react";

import { MemberAccess } from "./MemberAccess";
import { styles as s } from "./slug.styles";

// 로그인하지 않은 방문자에게만 값이 있다. 값이 없으면 로그인 모달을 열 수 없다.
const MemberLoginContext = createContext<(() => void) | null>(null);

export function useOpenMemberLogin() {
  return useContext(MemberLoginContext);
}

type MemberLoginProviderProps = {
  enabled: boolean;
  instructorSlug: string;
  initialError?: string;
  children: ReactNode;
};

export function MemberLoginProvider({
  enabled,
  instructorSlug,
  initialError,
  children,
}: MemberLoginProviderProps) {
  const [open, setOpen] = useState(false);

  if (!enabled) {
    return children;
  }

  return (
    <MemberLoginContext.Provider value={() => setOpen(true)}>
      {children}
      {/* 닫았다 열어도 메일 발송 상태가 유지되도록 마운트해 둔다. */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-label="회원 로그인"
        fullWidth
        maxWidth="xs"
        keepMounted
        slotProps={{
          backdrop: { sx: s.loginBackdrop },
          paper: { sx: s.loginPaper },
        }}
      >
        <IconButton
          aria-label="닫기"
          onClick={() => setOpen(false)}
          sx={s.loginClose}
        >
          <CloseRoundedIcon />
        </IconButton>
        <MemberAccess
          instructorSlug={instructorSlug}
          initialError={initialError}
        />
      </Dialog>
    </MemberLoginContext.Provider>
  );
}
