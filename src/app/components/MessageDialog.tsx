"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useId } from "react";

type MessageDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
};

export function MessageDialog({
  open,
  title,
  message,
  onClose,
  confirmText = "확인",
}: MessageDialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(23, 35, 28, 0.35)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            m: "20px",
            width: "calc(100% - 40px)",
            maxHeight: "calc(100dvh - 40px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 24px 80px rgba(23, 35, 28, 0.16)",
          },
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          p: "28px 24px 12px",
          fontSize: 20,
          fontWeight: 750,
          lineHeight: 1.5,
          letterSpacing: "-0.03em",
          textAlign: "center",
          wordBreak: "keep-all",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: "0 24px" }}>
        <DialogContentText
          id={descriptionId}
          sx={{
            m: 0,
            fontSize: 15,
            lineHeight: 1.8,
            textAlign: "center",
            wordBreak: "keep-all",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="contained"
          onClick={onClose}
          autoFocus
          fullWidth
          sx={{ minHeight: 50, borderRadius: "14px" }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
