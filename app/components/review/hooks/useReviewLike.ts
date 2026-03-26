import { useCallback, useEffect, useState } from "react";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { useAlert } from "store/context/alertContext";
import { getAuthHeaders, waitForAuthReady } from "@/utils/getIdToken";
import { isAuth } from "firebase-config";

export interface UseReviewLikeParams {
  reviewId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

export interface UseReviewLikeResult {
  isLiked: boolean;
  likeCount: number;
  isLikeLoading: boolean;
  toggleLike: () => Promise<void>;
}

/**
 * 리뷰 좋아요 상태 동기화·토글 (서버 API와 동일 계약)
 */
export function useReviewLike({
  reviewId,
  initialIsLiked,
  initialLikeCount,
}: UseReviewLikeParams): UseReviewLikeResult {
  const currentUser = useAppSelector(selectUser);
  const { showErrorHandler } = useAlert();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const isLoggedIn = !!currentUser?.uid;

  // 마운트 시 좋아요 상태 동기화
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        await waitForAuthReady();

        if (!isAuth.currentUser || isCancelled) return;

        const authHeaders = await getAuthHeaders();
        const response = await fetch("/api/reviews/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ reviewIds: [reviewId] }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          likes: Record<string, boolean>;
        };

        if (!isCancelled && data?.likes && reviewId in data.likes) {
          setIsLiked(data.likes[reviewId]);
        }
      } catch {
        // 네트워크/인증 오류는 초기 렌더 UX를 해치지 않기 위해 무시
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [reviewId, isLoggedIn]);

  const toggleLike = useCallback(async () => {
    if (!isAuth.currentUser || isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const authHeaders = await getAuthHeaders();

      const likeUrl = isLiked
        ? `/api/reviews/${reviewId}/likes/me`
        : `/api/reviews/${reviewId}/likes`;

      const response = await fetch(likeUrl, {
        method: isLiked ? "DELETE" : "POST",
        headers: authHeaders,
      });

      const text = await response.text();
      let data: { isLiked: boolean; likeCount: number; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("서버 응답을 처리할 수 없습니다.");
      }

      if (response.ok) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } else {
        throw new Error(data.error || "좋아요 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      showErrorHandler(
        "오류",
        error instanceof Error
          ? error.message
          : "좋아요 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLikeLoading(false);
    }
  }, [reviewId, isLiked, isLikeLoading, showErrorHandler]);

  return {
    isLiked,
    likeCount,
    isLikeLoading,
    toggleLike,
  };
}
