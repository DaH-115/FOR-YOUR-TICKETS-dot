"use client";

import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "firebase-config";
import { useAlert } from "store/context/alertContext";
import type {
  ReviewFormValues,
  UseReviewDataParams,
} from "app/write-review/types";

/**
 * 리뷰 데이터(초기값) 비동기 로딩 커스텀 훅
 * - 리뷰 수정 시 Firestore에서 기존 리뷰 데이터를 불러와 폼에 초기값으로 제공
 * @param mode - "edit"(수정) | "new"(작성)
 * @param reviewId - 리뷰 ID (수정 시)
 * @returns initialData, loading
 */
export function useReviewData({ mode, reviewId }: UseReviewDataParams) {
  const router = useRouter();
  const { showErrorHandler } = useAlert();
  const [initialData, setInitialData] = useState<ReviewFormValues>();
  const [loading, setLoading] = useState(true);

  // mode === "edit" && reviewId가 있을 때 Firestore에서 리뷰 데이터 비동기 로딩
  useEffect(() => {
    (async () => {
      try {
        if (mode === "edit" && reviewId) {
          const snap = await getDoc(doc(db, "movie-reviews", reviewId));
          if (snap.exists()) {
            const data = snap.data();
            setInitialData({
              reviewTitle: data.review?.reviewTitle || "",
              reviewContent: data.review?.reviewContent || "",
              rating: data.review?.rating || 5,
              isLiked: false,
            });
          }
        }
      } catch (error) {
        console.error("리뷰 데이터 로딩 실패:", error);
        showErrorHandler(
          "오류",
          "리뷰 데이터를 불러올 수 없습니다. 다시 시도해주세요.",
        );
        // 에러 발생 시 홈으로 이동
        router.push("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, reviewId, router, showErrorHandler]);

  return { initialData, loading };
}
