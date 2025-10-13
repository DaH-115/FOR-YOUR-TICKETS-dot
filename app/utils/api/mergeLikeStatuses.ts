import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";

// 좋아요 상태 맵을 리뷰 배열에 병합하는 유틸 함수
export function mergeLikeStatuses(
  reviews: ReviewDoc[],
  likesMap: Record<string, boolean>,
): ReviewDoc[] {
  if (!Array.isArray(reviews) || !likesMap) return reviews;

  return reviews.map((review) => ({
    ...review,
    review: {
      ...review.review,
      isLiked:
        review.review.isLiked === undefined
          ? Boolean(likesMap[review.id])
          : review.review.isLiked,
    },
  }));
}
