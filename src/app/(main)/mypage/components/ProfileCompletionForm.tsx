"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
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
import { MessageDialog } from "@/src/app/components/MessageDialog";

type ProfileCompletionFormProps = {
  userId: string;
  displayName: string;
  email: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileCompletionForm({
  userId,
  displayName,
  email,
  slug,
  bio,
  avatarUrl,
}: ProfileCompletionFormProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(avatarUrl);
  const [introduction, setIntroduction] = useState(bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    bio?: string;
    avatar?: string;
  }>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const isSubmitting = useRef(false);
  const uploadedAvatar = useRef<{ file: File; url: string } | null>(null);
  const isComplete = Boolean(bio?.trim() && savedAvatarUrl?.trim());

  useEffect(() => {
    if (!isLinkCopied) {
      return;
    }

    const timeout = window.setTimeout(() => setIsLinkCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isLinkCopied]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        new URL(`/${slug}`, window.location.origin).href,
      );
      setIsLinkCopied(true);
    } catch {
      setMessage("링크를 복사하지 못했습니다. 다시 시도해주세요.");
    }
  }

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
    const result = profileSchema.safeParse({
      displayName: name,
      bio: introduction,
    });
    const avatarResult = avatarFile
      ? avatarFileSchema.safeParse(avatarFile)
      : null;
    const errors = {
      displayName: result.success
        ? undefined
        : result.error.issues.find((issue) => issue.path[0] === "displayName")
            ?.message,
      bio: result.success
        ? undefined
        : result.error.issues.find((issue) => issue.path[0] === "bio")?.message,
      avatar:
        avatarResult && !avatarResult.success
          ? avatarResult.error.issues[0]?.message
          : !avatarFile && !savedAvatarUrl?.trim()
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
      let nextAvatarUrl = savedAvatarUrl;

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

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: result.data.displayName,
          bio: result.data.bio,
          avatarUrl: nextAvatarUrl,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setFieldErrors({
          displayName: data.fieldErrors?.displayName,
          bio: data.fieldErrors?.bio,
          avatar: data.fieldErrors?.avatarUrl,
        });
        setMessage(
          data.message || "내 정보를 저장하지 못했습니다. 다시 시도해주세요.",
        );
        return;
      }

      setSavedAvatarUrl(nextAvatarUrl);
      setAvatarFile(null);
      setPreviewUrl("");
      uploadedAvatar.current = null;
      setMessage("내 정보를 저장했어요.");
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
        마이페이지
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
        내 정보 관리
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, mb: 4, lineHeight: 1.8, wordBreak: "keep-all" }}
      >
        회원에게 보여줄 이름, 사진과 소개글을 관리하세요.
        {!isComplete ? (
          <Box component="span" sx={{ display: "block", mt: 1 }}>
            프로필 사진과 소개글을 추가하면 다른 메뉴를 이용할 수 있어요.
          </Box>
        ) : null}
      </Typography>

      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={handleSubmit}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 56,
            bgcolor: "#fafcfb",
            borderRadius: "16px",
          },
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
              src={previewUrl || savedAvatarUrl || undefined}
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
          name="displayName"
          label="표시 이름"
          required
          value={name}
          disabled={isLoading}
          error={Boolean(fieldErrors.displayName)}
          helperText={fieldErrors.displayName || "회원에게 보여지는 이름입니다."}
          slotProps={{ htmlInput: { maxLength: 50 } }}
          onChange={(event) => {
            setName(event.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              displayName: undefined,
            }));
            setMessage("");
          }}
        />

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

        <Box
          component="dl"
          sx={{
            m: 0,
            py: 1,
            borderTop: "1px solid #e7ede9",
            display: "grid",
            gap: 0,
          }}
        >
          {[
            {
              label: "이메일",
              value: email || "등록된 이메일 없음",
              Icon: EmailOutlinedIcon,
            },
            {
              label: "공개 주소",
              value: `/${slug}`,
              Icon: LinkRoundedIcon,
              canCopy: true,
            },
          ].map(({ label, value, Icon, canCopy }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                py: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  bgcolor: "#f5f8f6",
                  borderRadius: "12px",
                  color: "text.secondary",
                }}
              >
                <Icon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 12, lineHeight: 1.5 }}
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{
                    m: 0,
                    mt: 0.25,
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </Typography>
              </Box>
              {canCopy && (
                <Button
                  type="button"
                  size="small"
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleCopyLink}
                  aria-label="공개 주소 링크 복사"
                  sx={{
                    flexShrink: 0,
                    alignSelf: "center",
                    minHeight: 40,
                    px: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#f5f8f6",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#eaf2ed" },
                  }}
                >
                  {isLinkCopied ? "복사 완료" : "링크 복사"}
                </Button>
              )}
            </Box>
          ))}
        </Box>

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
            isComplete ? "변경사항 저장" : "프로필 완성하기"
          )}
        </Button>
      </Stack>

      <MessageDialog
        open={Boolean(message)}
        onClose={() => setMessage("")}
        title="내 정보 저장 안내"
        message={message}
      />
    </Paper>
  );
}
