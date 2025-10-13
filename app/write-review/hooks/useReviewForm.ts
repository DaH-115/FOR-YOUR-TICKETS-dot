"use client";

import { useAppSelector, useAppDispatch } from "store/redux-toolkit/hooks";
import {
  selectUser,
  fetchUserProfile,
} from "store/redux-toolkit/slice/userSlice";
import type {
  ReviewFormValues,
  UseReviewFormParams,
} from "@/write-review/types";
import { useLevelUp } from "store/context/levelUp/LevelUpContext";
import { useReviewSubmit } from "@/write-review/hooks/useReviewSubmit";
import { USER_LEVELS, type UserLevel } from "@/write-review/constants";

interface UseReviewFormReturn {
  onSubmit: (data: ReviewFormValues) => Promise<void>;
}

/**
 * 리뷰 작성/수정 폼의 메인 로직을 담당하는 커스텀 훅
 * - 리뷰 제출 처리 (useReviewSubmit 활용)
 * - 사용자 프로필 업데이트
 * - 레벨업 감지 및 전역 모달 트리거
 *
 * @param mode - "new" (작성) | "edit" (수정)
 * @param reviewId - 리뷰 ID (수정 시 필수)
 * @param movieData - 영화 기본 정보 (id, title, original_title, poster_path)
 * @returns 폼 제출 핸들러
 */
export default function useReviewForm({
  mode,
  reviewId,
  movieData,
}: UseReviewFormParams): UseReviewFormReturn {
  const userState = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const { submitReview } = useReviewSubmit();
  const { showLevelUpModal } = useLevelUp();

  /**
   * 유효한 사용자 등급인지 확인하는 타입 가드
   * @param level - 검증할 등급 문자열
   * @returns 유효한 UserLevel 타입 여부
   */
  const isValidUserLevel = (
    level: string | null | undefined,
  ): level is UserLevel => {
    if (!level) return false;
    return USER_LEVELS.includes(level as UserLevel);
  };

  /**
   * 등급이 상위 등급으로 올라갔는지 확인
   * @param prevLevel - 이전 등급
   * @param newLevel - 새로운 등급
   * @returns 레벨업 여부 (true: 레벨업, false: 등급 유지 또는 하락)
   */
  const isLevelUp = (
    prevLevel: string | null | undefined,
    newLevel: string | null | undefined,
  ): boolean => {
    // 타입 가드로 유효한 등급인지 검증
    if (!isValidUserLevel(prevLevel) || !isValidUserLevel(newLevel)) {
      return false;
    }

    // USER_LEVELS = ["NEWBIE", "REGULAR", "ACTIVE", "EXPERT"]
    // 배열에서 뒤에 있을수록 높은 등급
    const prevIndex = USER_LEVELS.indexOf(prevLevel);
    const newIndex = USER_LEVELS.indexOf(newLevel);

    // 새 등급이 더 높은 경우
    return newIndex > prevIndex;
  };

  /**
   * 리뷰 제출 후 사용자 프로필 업데이트 및 등급 변화 감지
   */
  const updateUserProfileAfterSubmit = async () => {
    if (!userState?.uid) return;

    // 1. 리뷰 제출 전 등급 저장
    const previousLevel = userState.activityLevel;

    // 2. 업데이트된 프로필 가져오기 (백엔드에서 새 등급 계산됨)
    const result = await dispatch(fetchUserProfile(userState.uid));

    // 3. 등급 변화 확인 및 레벨업 모달 표시
    if (result.payload) {
      const updatedUser = result.payload as typeof userState;
      const newLevel = updatedUser?.activityLevel;

      // 상위 등급으로 올라간 경우 모달 표시
      if (isLevelUp(previousLevel, newLevel)) {
        showLevelUpModal(newLevel!); // isLevelUp이 true면 newLevel은 유효한 UserLevel
      }
    }
  };

  /**
   * 리뷰 작성/수정 폼 제출 핸들러
   * - mode에 따라 리뷰 생성/수정 API 호출
   * - 성공 시 사용자 프로필 업데이트 및 레벨업 체크
   */
  const onSubmit = async (data: ReviewFormValues) => {
    try {
      // 리뷰 제출 (API 호출, 알림, 페이지 이동)
      await submitReview(mode, data, userState, movieData, reviewId);

      // 리뷰 작성 성공 후 프로필 refetch 및 등급 변화 감지
      await updateUserProfileAfterSubmit();
    } catch (error) {
      // 에러는 useReviewSubmit에서 처리되므로 여기서는 무시
      console.error("리뷰 제출 실패:", error);
    }
  };

  return {
    onSubmit,
  };
}
