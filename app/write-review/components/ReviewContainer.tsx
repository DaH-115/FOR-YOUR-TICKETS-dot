"use client";

import type { ReviewMode } from "@/write-review/types";
import Loading from "@/loading";
import ReviewForm from "@/write-review/components/ReviewForm";
import { useReviewData } from "@/write-review/hooks/useReviewData";
import { MovieDetails } from "lib/movies/fetchMovieDetails";

interface ReviewContainerProps {
  mode: ReviewMode;
  reviewId?: string;
  movieData: MovieDetails;
}

export default function ReviewContainer({
  mode = "new",
  reviewId,
  movieData,
}: ReviewContainerProps) {
  const { initialData, loading } = useReviewData({
    mode,
    reviewId,
  });

  if (loading) return <Loading />;

  return (
    <ReviewForm
      onSubmitMode={mode}
      initialData={initialData}
      movieData={movieData}
      reviewId={reviewId}
    />
  );
}
