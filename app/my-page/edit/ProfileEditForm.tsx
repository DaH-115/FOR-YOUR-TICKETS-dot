"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";

import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { z } from "zod";
import BioInput from "@/my-page/components/BioInput";
import ChangePassword from "@/my-page/components/ChangePassword";
import NicknameInput from "@/my-page/components/NicknameInput";
import AvatarUploader from "@/my-page/components/profile-avatar/AvatarUploader";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { isAuth } from "firebase-config";
import { useAlert } from "store/context/alertContext";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useProfileEditForm } from "@/my-page/hooks/useProfileEditForm";
import { PROFILE_EDIT_MESSAGES } from "@/my-page/edit/constants";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(20, "이름은 20자를 초과할 수 없습니다")
    .regex(/^[가-힣a-zA-Z0-9\s_]+$/, "이름에 특수문자를 사용할 수 없습니다"),
  biography: z
    .string()
    .max(100, "바이오는 100자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditForm() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const currentUser = isAuth.currentUser;
  const { showErrorHandler } = useAlert();

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    formState: { dirtyFields, isSubmitting },
    reset,
  } = methods;

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // displayName 변경 감지
  const watchedDisplayName = useWatch({ name: "displayName", control });

  // 닉네임이 변경되면 중복 체크 상태 초기화
  useEffect(() => {
    if (watchedDisplayName !== user?.displayName) {
      setIsNicknameChecked(false);
    } else {
      setIsNicknameChecked(true); // 원래 값으로 돌아가면 체크된 것으로 간주
    }
  }, [watchedDisplayName, user?.displayName]);

  const hasDirty = Object.keys(dirtyFields).length > 0 || hasImageChanged;

  // 제출 가능 조건: 변경사항이 있고, 닉네임이 변경되었다면 중복 체크가 완료되어야 함
  const canSubmit =
    hasDirty &&
    !isSubmitting &&
    (dirtyFields.displayName ? isNicknameChecked : true);

  // 커스텀 훅으로 비즈니스 로직 분리
  const { onSubmit } = useProfileEditForm({
    methods,
    selectedFile,
    hasImageChanged,
    isNicknameChecked,
  });

  // 초기값 설정
  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || "",
        biography: user.biography || "",
      });
      // 초기 로드 시에는 닉네임이 체크된 것으로 간주
      setIsNicknameChecked(true);
    }
  }, [reset, user]);

  // 사용자가 로그인하지 않은 경우 리다이렉트
  useEffect(() => {
    if (!currentUser || !user?.uid) {
      router.push("/login");
    }
  }, [currentUser, user, router]);

  const handleCancel = useCallback(() => {
    if (hasDirty) {
      if (confirm(PROFILE_EDIT_MESSAGES.CONFIRM.UNSAVED_CHANGES)) {
        router.push("/my-page");
      }
    } else {
      router.push("/my-page");
    }
  }, [hasDirty, router]);

  return (
    <main
      className="mx-auto flex min-h-full w-full max-w-2xl flex-col"
      aria-busy={isSubmitting}
    >
      {/* 헤더 */}
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="text-gray-400"
            disabled={isSubmitting}
            aria-label="뒤로가기"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-white">프로필 편집</h1>
        </div>
        <button
          type="submit"
          form="profile-edit-form"
          disabled={!canSubmit}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            canSubmit
              ? "bg-accent-300 hover:bg-accent-500 text-white"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
          aria-label={isSubmitting ? "저장 중" : "변경사항 저장"}
        >
          <FaCheck size={12} />
          {isSubmitting ? "저장 중..." : "완료"}
        </button>
      </div>

      <FormProvider {...methods}>
        <form
          id="profile-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center lg:items-stretch"
        >
          {/* 프로필 이미지 섹션 */}
          <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-bold">프로필 사진</h2>
            <div className="flex flex-col items-center gap-4">
              <ProfileAvatar
                userDisplayName={user?.displayName ?? "사용자"}
                s3photoKey={user?.photoKey}
                previewSrc={previewSrc || undefined}
                size={96}
                className="mx-auto"
                showLoading={true}
              />
              <AvatarUploader
                onPreview={(url) => setPreviewSrc(url)}
                onCancelPreview={() => setPreviewSrc(null)}
                onFileSelect={(file) => setSelectedFile(file)}
                onImageChange={(hasChanged) => setHasImageChanged(hasChanged)}
                onError={(message) =>
                  showErrorHandler("파일 선택 오류", message)
                }
              />
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-bold">기본 정보</h2>
            <div className="space-y-6">
              {user?.email && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    이메일
                  </label>
                  <div className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600">
                    {user.email}
                  </div>
                </div>
              )}

              <NicknameInput
                originalValue={user?.displayName}
                isEditing={true}
                onDuplicateCheckSuccess={() => setIsNicknameChecked(true)}
              />

              <BioInput isEditing={true} originalValue={user?.biography} />
            </div>
          </div>

          {/* 비밀번호 변경 섹션 */}
          {user?.provider === "email" && (
            <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xs">
              <ChangePassword />
            </div>
          )}
        </form>
      </FormProvider>
    </main>
  );
}
