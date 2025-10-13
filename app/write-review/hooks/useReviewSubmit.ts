"use client";

import { useRouter } from "next/navigation";
import type { User } from "store/redux-toolkit/slice/userSlice";
import type { MovieDetails } from "lib/movies/fetchMovieDetails";
import type { ReviewFormValues } from "@/write-review/types";
import { useAlert } from "store/context/alertContext";
import { firebaseErrorHandler } from "@/utils/firebaseError";
import { getIdToken } from "@/utils/getIdToken/getIdToken";
import { postReview } from "@/utils/api/postReview";
import { putReview } from "@/utils/api/putReview";
import { buildReviewApiData } from "@/write-review/utils/buildReviewApiData";
import {
  REVIEW_MESSAGES,
  REVIEW_REDIRECT_PATHS,
} from "@/write-review/constants";

/**
 * 리뷰 제출 처리를 담당하는 커스텀 훅
 * - API 호출 (생성/수정)
 * - 성공/에러 알림 처리
 * - 성공 시 페이지 이동
 */
export function useReviewSubmit() {
  const router = useRouter();
  const { showErrorHandler, showSuccessHandler, hideSuccessHandler } =
    useAlert();

  /**
   * 리뷰 생성 처리
   */
  const createReview = async (
    userState: User,
    movieData: MovieDetails,
    formData: ReviewFormValues,
  ) => {
    const idToken = await getIdToken();
    const authHeaders = { Authorization: `Bearer ${idToken}` };

    const reviewApiData = buildReviewApiData(userState, movieData, formData);

    await postReview({
      reviewData: reviewApiData,
      authHeaders,
    });

    showSuccessHandler(
      REVIEW_MESSAGES.ALERT_TITLE,
      REVIEW_MESSAGES.CREATE_SUCCESS,
      () => {
        hideSuccessHandler();
        router.push(REVIEW_REDIRECT_PATHS.CREATE);
      },
    );
  };

  /**
   * 리뷰 수정 처리
   */
  const updateReview = async (reviewId: string, formData: ReviewFormValues) => {
    const idToken = await getIdToken();
    const authHeaders = { Authorization: `Bearer ${idToken}` };

    await putReview({
      reviewId,
      reviewData: formData,
      authHeaders,
    });

    showSuccessHandler(
      REVIEW_MESSAGES.ALERT_TITLE,
      REVIEW_MESSAGES.UPDATE_SUCCESS,
      () => {
        hideSuccessHandler();
        router.push(REVIEW_REDIRECT_PATHS.UPDATE);
      },
    );
  };

  /**
   * 리뷰 제출 핸들러 (생성 또는 수정)
   * @param mode - "new" (생성) | "edit" (수정)
   * @param formData - 리뷰 폼 데이터
   * @param userState - 현재 사용자 정보
   * @param movieData - 영화 상세 정보
   * @param reviewId - 리뷰 ID (수정 시 필수)
   * @throws 에러 발생 시 알림 표시 후 throw
   */
  const submitReview = async (
    mode: "new" | "edit",
    formData: ReviewFormValues,
    userState: User | null,
    movieData: MovieDetails,
    reviewId?: string,
  ) => {
    if (!userState) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      if (mode === "new") {
        await createReview(userState, movieData, formData);
      } else if (mode === "edit" && reviewId) {
        await updateReview(reviewId, formData);
      }
    } catch (error) {
      const { title, message } = firebaseErrorHandler(error);
      showErrorHandler(title, message);
      throw error; // 상위에서 추가 처리가 필요한 경우를 위해 re-throw
    }
  };

  return {
    submitReview,
  };
}
