import { adminFirestore } from "firebase-admin-config";
import type { ReviewDoc } from "types/review";

/**
 * ID로 개별 리뷰를 조회합니다.
 * 서버 컴포넌트와 API 라우트에서 공통으로 사용합니다.
 *
 * @param reviewId - 조회할 리뷰 ID
 * @param uid - 좋아요 상태 확인용 사용자 ID (선택, 없으면 isLiked는 false)
 * @returns ReviewDoc 또는 없으면 null
 */
export async function getReviewById(
  reviewId: string,
  uid: string | null = null,
): Promise<ReviewDoc | null> {
  const doc = await adminFirestore
    .collection("movie-reviews")
    .doc(reviewId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  // 좋아요 상태 확인
  let isLiked = false;
  if (uid) {
    const likeDoc = await adminFirestore
      .collection("movie-reviews")
      .doc(reviewId)
      .collection("likedBy")
      .doc(uid)
      .get();
    isLiked = likeDoc.exists;
  }

  // 리뷰 순서 계산 (해당 리뷰보다 오래된 리뷰 개수 + 1)
  const createdAt = data.review.createdAt;
  let orderNumber = 1;

  if (createdAt && typeof createdAt.toDate === "function") {
    const olderReviewsQuery = await adminFirestore
      .collection("movie-reviews")
      .where("review.createdAt", "<", createdAt)
      .count()
      .get();

    orderNumber = olderReviewsQuery.data().count + 1;
  }

  const reviewData: ReviewDoc = {
    id: doc.id,
    user: data.user,
    review: {
      ...data.review,
      likeCount: data.likeCount || data.review.likeCount || 0,
      createdAt:
        typeof data.review.createdAt?.toDate === "function"
          ? data.review.createdAt.toDate().toISOString()
          : "",
      updatedAt:
        typeof data.review.updatedAt?.toDate === "function"
          ? data.review.updatedAt.toDate().toISOString()
          : "",
      isLiked,
    },
    orderNumber,
  };

  return reviewData;
}
