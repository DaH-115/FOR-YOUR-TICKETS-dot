"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useReviewLike } from "@/components/review/hooks/useReviewLike";

interface ReviewDetailLikeProps {
  reviewId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

/**
 * 리뷰 상세 카드용 좋아요 UI (상태·API는 useReviewLike)
 */
export default function ReviewDetailLike({
  reviewId,
  initialIsLiked,
  initialLikeCount,
}: ReviewDetailLikeProps) {
  const { isLiked, likeCount, isLikeLoading, toggleLike } = useReviewLike({
    reviewId,
    initialIsLiked,
    initialLikeCount,
  });

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`transition ${isLikeLoading ? "cursor-not-allowed" : "hover:scale-110"}`}
        onClick={() => void toggleLike()}
        disabled={isLikeLoading}
        aria-pressed={isLiked}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        {isLiked ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-500" />
        )}
      </button>
      <p className="text-sm text-gray-800">{likeCount}</p>
    </div>
  );
}
