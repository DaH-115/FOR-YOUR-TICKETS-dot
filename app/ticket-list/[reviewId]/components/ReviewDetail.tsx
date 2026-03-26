import { ReviewDoc } from "types";
import MoviePoster from "@/components/movie/MoviePoster";
import ReviewDetailCard from "@/components/review/ReviewDetailCard";

interface ReviewDetailProps {
  review: ReviewDoc;
}

export default function ReviewDetail({ review }: ReviewDetailProps) {
  const { user, review: content } = review;

  return (
    <main className="3xl:max-w-[1600px] mx-8 flex flex-col gap-8 lg:mx-12 lg:flex-row lg:items-start lg:justify-center lg:gap-10 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 영화 포스터  */}
      <div className="mx-auto w-full max-w-md shrink-0 lg:mx-0 lg:w-72 xl:w-80">
        <MoviePoster
          posterPath={content.moviePosterPath || ""}
          title={content.movieTitle}
          importance="hero"
        />
      </div>
      {/* 리뷰 내용 */}
      <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0">
        <ReviewDetailCard review={review} user={user} />
      </div>
    </main>
  );
}
