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

import { styles as s } from "./messageDialog.styles";

type MessageDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  isPending?: boolean;
  confirmColor?: "primary" | "error";
};

export function MessageDialog({
  open,
  title,
  message,
  onClose,
  confirmText = "확인",
  onConfirm,
  isPending = false,
  confirmColor = "primary",
}: MessageDialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: { sx: s.backdrop },
        paper: { sx: s.paper },
      }}
    >
      <DialogTitle id={titleId} sx={s.title}>
        {title}
      </DialogTitle>
      <DialogContent sx={s.content}>
        <DialogContentText id={descriptionId} sx={s.message}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions disableSpacing sx={s.actions}>
        {onConfirm && (
          <Button
            onClick={onClose}
            disabled={isPending}
            autoFocus
            fullWidth
            sx={s.cancelButton}
          >
            취소
          </Button>
        )}
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm ?? onClose}
          disabled={isPending}
          autoFocus={!onConfirm}
          fullWidth
          sx={s.confirmButton}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
