import { Metadata } from "next";
import ReviewContainer from "app/write-review/components/ReviewContainer";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";

export const metadata: Metadata = {
  title: "새로운 티켓 작성",
  description: "새로운 티켓을 작성하는 페이지입니다",
};

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ movieId?: string }>;
}) {
  const { movieId: movieIdParam } = await searchParams;
  const movieId = Number(movieIdParam!);
  const movieData = await fetchMovieDetails(movieId);

  return <ReviewContainer mode="new" movieData={movieData} />;
}
