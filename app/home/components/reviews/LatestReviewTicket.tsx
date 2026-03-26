"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import ReviewCard from "@/components/review/ReviewCard";

function LatestReviewTicket({ review }: { review: ReviewDoc }) {
  const { user } = review;
  const router = useRouter();

  // 리뷰 클릭 시 티켓 상세 페이지로 이동
  const handleReviewClick = useCallback(() => {
    router.push(`/ticket-list/${review.id}`);
  }, [router, review.id]);

  return (
    <ReviewCard
      user={user}
      reviews={review}
      handleReviewClick={handleReviewClick}
    />
  );
}

export default memo(LatestReviewTicket);
