"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SubmitEvent } from "react";

import {
  avatarFileSchema,
  profileSchema,
} from "@/src/lib/schemas/profileSchemas";
import { createClient } from "@/src/lib/supabase/client";

type ProfileCompletionFormProps = {
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileCompletionForm({
  userId,
  bio,
  avatarUrl,
}: ProfileCompletionFormProps) {
  const router = useRouter();
  const [introduction, setIntroduction] = useState(bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    bio?: string;
    avatar?: string;
  }>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);
  const uploadedAvatar = useRef<{ file: File; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleAvatarChange(file: File | undefined) {
    uploadedAvatar.current = null;
    setMessage("");
    setAvatarFile(null);
    setPreviewUrl("");

    if (!file) {
      setFieldErrors((previous) => ({ ...previous, avatar: undefined }));
      return;
    }

    const result = avatarFileSchema.safeParse(file);
    if (!result.success) {
      setFieldErrors((previous) => ({
        ...previous,
        avatar: result.error.issues[0]?.message,
      }));
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFieldErrors((previous) => ({ ...previous, avatar: undefined }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) {
      return;
    }

    setMessage("");
    const result = profileSchema.safeParse({ bio: introduction });
    const avatarResult = avatarFile
      ? avatarFileSchema.safeParse(avatarFile)
      : null;
    const errors = {
      bio: result.success ? undefined : result.error.issues[0]?.message,
      avatar:
        avatarResult && !avatarResult.success
          ? avatarResult.error.issues[0]?.message
          : !avatarFile && !avatarUrl?.trim()
            ? "프로필 사진을 선택해주세요."
            : fieldErrors.avatar,
    };
    setFieldErrors(errors);
    if (!result.success || errors.avatar) {
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      const supabase = createClient();
      let nextAvatarUrl = avatarUrl;

      if (avatarFile) {
        if (uploadedAvatar.current?.file === avatarFile) {
          nextAvatarUrl = uploadedAvatar.current.url;
        } else {
          const extension = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
          }[avatarFile.type];
          const path = `${userId}/${crypto.randomUUID()}.${extension}`;
          const { error } = await supabase.storage
            .from("profile-avatars")
            .upload(path, avatarFile, {
              contentType: avatarFile.type,
              upsert: false,
            });

          if (error) {
            setMessage(
              "프로필 사진을 업로드하지 못했습니다. 다시 시도해주세요.",
            );
            return;
          }

          const { data } = supabase.storage
            .from("profile-avatars")
            .getPublicUrl(path);
          nextAvatarUrl = data.publicUrl;
          uploadedAvatar.current = { file: avatarFile, url: nextAvatarUrl };
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          bio: result.data.bio,
          avatar_url: nextAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .single();

      if (error || !data) {
        setMessage("프로필을 저장하지 못했습니다. 다시 시도해주세요.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        border: "1px solid",
        borderColor: "#e7ede9",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(29, 77, 56, 0.035)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "inline-block",
          px: 1.5,
          py: 0.5,
          bgcolor: "#eef5f0",
          borderRadius: "20px",
          color: "primary.main",
          fontWeight: 700,
        }}
      >
        나의 첫 핏노트
      </Typography>
      <Typography
        component="h1"
        sx={{
          mt: 2,
          fontSize: { xs: 25, sm: 30 },
          fontWeight: 750,
          letterSpacing: -0.8,
          lineHeight: 1.4,
          wordBreak: "keep-all",
        }}
      >
        회원님들께 나를 소개해주세요
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, mb: 4, lineHeight: 1.8, wordBreak: "keep-all" }}
      >
        사진 한 장과 짧은 소개로 나만의 프로필을 완성해보세요.
      </Typography>

      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={handleSubmit}
        sx={{
          "& .MuiOutlinedInput-root": { minHeight: 56 },
          "& .MuiFormHelperText-root": { minHeight: 23, lineHeight: "20px" },
        }}
      >
        <Box sx={{ textAlign: "center", py: 1 }}>
          <Button
            component="label"
            disabled={isLoading}
            sx={{
              position: "relative",
              p: 0,
              minWidth: 0,
              borderRadius: "50%",
              transition: "box-shadow 160ms ease",
              "&:hover": {
                bgcolor: "transparent",
                boxShadow: "0 0 0 6px #f1f6f3",
              },
              "&:focus-within": {
                outline: "2px solid #276749",
                outlineOffset: 5,
              },
              "&.Mui-disabled": { opacity: 0.6 },
            }}
          >
            <Avatar
              src={previewUrl || avatarUrl || undefined}
              alt="프로필 사진 미리보기"
              sx={{
                width: 112,
                height: 112,
                bgcolor: "#edf3ef",
                color: "#92aa9a",
                border: "1px solid #e0e9e3",
              }}
            />
            <Box
              component="span"
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "white",
                border: "3px solid white",
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isLoading}
              aria-label="프로필 사진 선택"
              aria-describedby="avatar-helper-text"
              aria-invalid={Boolean(fieldErrors.avatar)}
              onChange={(event) => {
                handleAvatarChange(event.target.files?.[0]);
                event.target.value = "";
              }}
              style={{
                clip: "rect(0 0 0 0)",
                clipPath: "inset(50%)",
                height: 1,
                overflow: "hidden",
                position: "absolute",
                whiteSpace: "nowrap",
                width: 1,
              }}
            />
          </Button>
          <FormHelperText
            id="avatar-helper-text"
            error={Boolean(fieldErrors.avatar)}
            sx={{ mx: 0, mt: 1.5, textAlign: "center" }}
          >
            {fieldErrors.avatar || " "}
          </FormHelperText>
        </Box>

        <TextField
          name="bio"
          label="소개글"
          placeholder="어떤 수업을 진행하는지 간단하게 소개해주세요."
          required
          multiline
          rows={5}
          value={introduction}
          disabled={isLoading}
          error={Boolean(fieldErrors.bio)}
          helperText={fieldErrors.bio || `${introduction.length} / 500자`}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#fafcfb",
              borderRadius: "16px",
              lineHeight: 1.8,
              transition: "background-color 160ms ease",
              "&:hover": { bgcolor: "#f5f8f6" },
              "&.Mui-focused": { bgcolor: "white" },
            },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dfe7e2" },
            "& .MuiFormHelperText-root": {
              textAlign: fieldErrors.bio ? "left" : "right",
            },
          }}
          onChange={(event) => {
            setIntroduction(event.target.value);
            setFieldErrors((previous) => ({ ...previous, bio: undefined }));
            setMessage("");
          }}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            minHeight: 54,
            borderRadius: "14px",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {isLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "저장하고 시작하기"
          )}
        </Button>
      </Stack>

      <Dialog
        open={Boolean(message)}
        onClose={() => setMessage("")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>프로필 저장 안내</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessage("")}>확인</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
