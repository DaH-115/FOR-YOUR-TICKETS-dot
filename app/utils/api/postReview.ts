import { ReviewFormValues } from "@/write-review/types";

// 리뷰 생성 API 데이터 타입
export interface ReviewApiData {
  user: {
    uid: string | null;
    displayName: string | null;
    photoKey: string | null;
  };
  review: ReviewFormValues & {
    movieId: number;
    movieTitle: string;
    originalTitle: string;
    moviePosterPath?: string;
    releaseYear: string;
    likeCount: number;
  };
}
// 리뷰 생성 API 호출 유틸
export async function postReview({
  reviewData,
  authHeaders,
}: {
  reviewData: ReviewApiData;
  authHeaders: Record<string, string>;
}) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "review/create-failed");
  }
  return response.json();
}
