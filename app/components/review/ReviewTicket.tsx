import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import MoviePoster from "@/components/movie/MoviePoster";
import ReviewListCard from "@/components/review/ReviewListCard";

export default function ReviewTicket({ review }: { review: ReviewDoc }) {
  const router = useRouter();
  const handleReviewClick = useCallback(() => {
    router.push(`/ticket-list/${review.id}`);
  }, [router, review.id]);

  return (
    <div className="relative flex cursor-pointer flex-col">
      {typeof review.orderNumber === "number" && (
        <div
          className="absolute top-3 right-3 z-50 text-xs font-semibold text-gray-200"
          data-testid="review-ticket-order"
        >
          No.{review.orderNumber}
        </div>
      )}
      <MoviePoster
        posterPath={review.review.moviePosterPath || ""}
        title={review.review.movieTitle}
      />
      <ReviewListCard
        user={review.user}
        reviews={review}
        handleReviewClick={handleReviewClick}
      />
    </div>
  );
}
