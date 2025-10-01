import { ReviewFormValues } from "@/write-review/types";

// 리뷰 수정 API 호출 유틸
export async function putReview({
  reviewId,
  reviewData,
  authHeaders,
}: {
  reviewId: string;
  reviewData: ReviewFormValues;
  authHeaders: Record<string, string>;
}) {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "review/update-failed");
  }
  return response.json();
}
