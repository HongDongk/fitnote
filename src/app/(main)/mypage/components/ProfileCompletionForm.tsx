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

import { MessageDialog } from "@/src/app/components/Dialog/MessageDialog";
import { useUpdateProfile } from "@/src/features/profile/hooks";
import { ApiError } from "@/src/lib/api/error";
import {
  avatarFileSchema,
  profileSchema,
} from "@/src/lib/schemas/profileSchemas";
import { createClient } from "@/src/lib/supabase/client";

import { styles as s, visuallyHidden } from "./mypage.styles";

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
  const updateProfile = useUpdateProfile();
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

      await updateProfile.mutateAsync({
        displayName: result.data.displayName,
        bio: result.data.bio,
        avatarUrl: nextAvatarUrl ?? "",
      });

      setSavedAvatarUrl(nextAvatarUrl);
      setAvatarFile(null);
      setPreviewUrl("");
      uploadedAvatar.current = null;
      setMessage("내 정보를 저장했어요.");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors({
          displayName: error.fieldErrors.displayName,
          bio: error.fieldErrors.bio,
          avatar: error.fieldErrors.avatarUrl,
        });
        setMessage(error.message);
      } else {
        setMessage("요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <Paper component="section" elevation={0} sx={s.card}>
      <Typography sx={s.overline}>마이페이지</Typography>
      <Typography component="h1" sx={s.title}>
        내 정보 관리
      </Typography>
      <Typography sx={s.description}>
        회원에게 보여줄 이름, 사진과 소개글을 관리하세요.
        {!isComplete ? (
          <Box component="span" sx={s.notice}>
            프로필 사진과 소개글을 추가하면 다른 메뉴를 이용할 수 있어요.
          </Box>
        ) : null}
      </Typography>

      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={handleSubmit}
        sx={s.form}
      >
        <Box sx={s.avatarSection}>
          <Button component="label" disabled={isLoading} sx={s.avatarButton}>
            <Avatar
              src={previewUrl || savedAvatarUrl || undefined}
              alt="프로필 사진 미리보기"
              sx={s.avatar}
            />
            <Box component="span" sx={s.avatarBadge}>
              <AddRoundedIcon sx={s.avatarBadgeIcon} />
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
              style={visuallyHidden}
            />
          </Button>
          <FormHelperText
            id="avatar-helper-text"
            error={Boolean(fieldErrors.avatar)}
            sx={s.avatarHelper}
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
          helperText={
            fieldErrors.displayName || "회원에게 보여지는 이름입니다."
          }
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
          sx={[s.bioField, !fieldErrors.bio && s.bioCounter]}
          onChange={(event) => {
            setIntroduction(event.target.value);
            setFieldErrors((previous) => ({ ...previous, bio: undefined }));
            setMessage("");
          }}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />

        <Box component="dl" sx={s.infoList}>
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
            <Box key={label} sx={s.infoItem}>
              <Box sx={s.infoIconBox}>
                <Icon sx={s.infoIcon} />
              </Box>
              <Box sx={s.infoText}>
                <Typography component="dt" sx={s.infoLabel}>
                  {label}
                </Typography>
                <Typography component="dd" sx={s.infoValue}>
                  {value}
                </Typography>
              </Box>
              {canCopy && (
                <Button
                  type="button"
                  size="small"
                  startIcon={<ContentCopyRoundedIcon sx={s.copyIcon} />}
                  onClick={handleCopyLink}
                  aria-label="공개 주소 링크 복사"
                  sx={s.copyButton}
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
          sx={s.submitButton}
        >
          {isLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : isComplete ? (
            "변경사항 저장"
          ) : (
            "프로필 완성하기"
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
