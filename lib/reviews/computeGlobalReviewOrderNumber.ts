import { adminFirestore } from "firebase-admin-config";
import type { Timestamp } from "firebase-admin/firestore";

/**
 * 전체 movie-reviews 기준 순번: 해당 글보다 createdAt이 이른 리뷰 개수 + 1
 * (getReviewById와 동일 규칙 — 상세·목록·생성 시 일치)
 */
export async function computeGlobalReviewOrderNumber(
  createdAt: Timestamp,
): Promise<number> {
  const olderReviewsQuery = await adminFirestore
    .collection("movie-reviews")
    .where("review.createdAt", "<", createdAt)
    .count()
    .get();

  return olderReviewsQuery.data().count + 1;
}
