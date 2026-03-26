import { notFound } from "next/navigation";
import { getReviewById } from "lib/reviews/getReviewById";
import ReviewDetail from "app/ticket-list/[reviewId]/components/ReviewDetail";

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>;
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { reviewId } = await params;
  // 서버 컴포넌트에서 데이터 레이어 직접 호출 (uid 없으면 isLiked는 false, 클라이언트에서 갱신)
  const review = await getReviewById(reviewId, null);

  if (!review) return notFound();

  return <ReviewDetail review={review} />;
}
