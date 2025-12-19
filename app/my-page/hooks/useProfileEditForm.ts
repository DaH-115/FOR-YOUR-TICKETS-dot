"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { useAlert } from "store/context/alertContext";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import {
  updateUserProfile,
  selectUser,
} from "store/redux-toolkit/slice/userSlice";
import { isAuth } from "firebase-config";
import { firebaseErrorHandler } from "@/utils/firebaseError";
import {
  PROFILE_EDIT_MESSAGES,
  PROFILE_EDIT_REDIRECT_PATH,
} from "@/my-page/edit/constants";

interface ProfileFormData {
  displayName: string;
  biography?: string;
}

interface UseProfileEditFormProps {
  methods: UseFormReturn<ProfileFormData>;
  selectedFile: File | null;
  hasImageChanged: boolean;
  isNicknameChecked: boolean;
}

interface UpdatePayload {
  displayName?: string;
  biography?: string;
  photoKey?: string;
}

/**
 * 프로필 편집 폼 제출 로직을 담당하는 커스텀 훅
 * - S3 이미지 업로드 처리
 * - 프로필 업데이트 API 호출
 */
export function useProfileEditForm({
  methods,
  selectedFile,
  hasImageChanged,
  isNicknameChecked,
}: UseProfileEditFormProps) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const currentUser = isAuth.currentUser;
  const { showErrorHandler, showSuccessHandler } = useAlert();
  const dispatch = useAppDispatch();

  const { formState } = methods;
  const { dirtyFields } = formState;

  // S3에 이미지 업로드
  const uploadImageToS3 = useCallback(
    async (file: File): Promise<string> => {
      if (!currentUser) {
        throw new Error(PROFILE_EDIT_MESSAGES.ERROR.LOGIN_REQUIRED);
      }

      // S3 Presigned URL 요청
      const presignedRes = await fetch("/api/s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!presignedRes.ok) {
        const errorData = await presignedRes.json();
        throw new Error(
          errorData.error ||
            PROFILE_EDIT_MESSAGES.ERROR.IMAGE_UPLOAD_PREPARE_FAILED,
        );
      }

      const { url, key } = await presignedRes.json();

      // S3에 이미지 업로드
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(PROFILE_EDIT_MESSAGES.ERROR.IMAGE_UPLOAD_FAILED);
      }

      return key;
    },
    [currentUser],
  );

  // 변경된 필드를 기반으로 업데이트 페이로드 생성
  const buildUpdatePayload = useCallback(
    async (data: ProfileFormData): Promise<UpdatePayload> => {
      const updatePayload: UpdatePayload = {};

      // 변경된 필드만 업데이트 대상에 포함
      if (dirtyFields.displayName && data.displayName !== user?.displayName) {
        updatePayload.displayName = data.displayName;
      }
      if (dirtyFields.biography && data.biography !== user?.biography) {
        updatePayload.biography = data.biography;
      }

      // 이미지 업로드 처리
      if (selectedFile && hasImageChanged) {
        const photoKey = await uploadImageToS3(selectedFile);
        updatePayload.photoKey = photoKey;
      }

      return updatePayload;
    },
    [
      dirtyFields.displayName,
      dirtyFields.biography,
      user,
      selectedFile,
      hasImageChanged,
      uploadImageToS3,
    ],
  );

  // 프로필 업데이트 제출 핸들러
  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      if (!currentUser || !user?.uid) {
        showErrorHandler(
          PROFILE_EDIT_MESSAGES.ALERT_TITLE,
          PROFILE_EDIT_MESSAGES.ERROR.LOGIN_REQUIRED,
        );
        return;
      }

      // 닉네임이 변경되었는데 중복 체크를 하지 않은 경우
      if (
        dirtyFields.displayName &&
        data.displayName !== user?.displayName &&
        !isNicknameChecked
      ) {
        showErrorHandler(
          PROFILE_EDIT_MESSAGES.ALERT_TITLE,
          PROFILE_EDIT_MESSAGES.ERROR.DUPLICATE_CHECK_REQUIRED,
        );
        return;
      }

      try {
        const updatePayload = await buildUpdatePayload(data);

        // updatePayload가 이미 변경된 필드만 포함하므로 항상 API 호출
        await dispatch(
          updateUserProfile({ uid: user.uid, data: updatePayload }),
        ).unwrap();

        showSuccessHandler(
          PROFILE_EDIT_MESSAGES.ALERT_TITLE,
          PROFILE_EDIT_MESSAGES.SUCCESS,
        );

        // 성공 시 마이페이지로 이동
        router.push(PROFILE_EDIT_REDIRECT_PATH);
      } catch (error) {
        const { title, message } = firebaseErrorHandler(error);
        showErrorHandler(title, message);
        throw error; // 상위에서 추가 처리가 필요한 경우를 위해 re-throw
      }
    },
    [
      currentUser,
      user,
      dispatch,
      showErrorHandler,
      showSuccessHandler,
      router,
      dirtyFields.displayName,
      isNicknameChecked,
      buildUpdatePayload,
    ],
  );

  return {
    onSubmit,
  };
}
