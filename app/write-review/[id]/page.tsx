import { Metadata } from "next";
import ReviewContainer from "app/write-review/components/ReviewContainer";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";

export const metadata: Metadata = {
  title: "티켓 수정",
  description: "티켓을 수정하는 페이지입니다",
};

export default async function EditReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ movieId?: string }>;
}) {
  const [{ id }, { movieId: movieIdParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const movieId = Number(movieIdParam!);
  const movieData = await fetchMovieDetails(movieId);

  return (
    <ReviewContainer mode="edit" reviewId={id} movieData={movieData} />
  );
}
