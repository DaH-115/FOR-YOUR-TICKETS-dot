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
  params: { id: string };
  searchParams: { movieId?: string };
}) {
  const movieId = Number(searchParams.movieId!);
  const movieData = await fetchMovieDetails(movieId);

  return (
    <ReviewContainer mode="edit" reviewId={params.id} movieData={movieData} />
  );
}
