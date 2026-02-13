import { notFound } from "next/navigation";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import ReviewDetail from "./components/ReviewDetail";

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>;
}

async function fetchReviewFromAPI(reviewId: string): Promise<ReviewDoc | null> {
  try {
    // 서버 컴포넌트에서는 절대 URL 사용
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/reviews/${reviewId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("리뷰 API 호출 실패:", error);
    return null;
  }
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { reviewId } = await params;
  const review = await fetchReviewFromAPI(reviewId);

  if (!review) return notFound();

  return <ReviewDetail review={review} reviewId={reviewId} />;
}
