import HomePage from "@/home/HomePage";
import { fetchNowPlayingMovies } from "lib/movies/fetchNowPlayingMovies";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { getRecommendMovie } from "lib/movies/getRecommendMovie";
import { notFound } from "next/navigation";

export default async function Page() {
  const [nowPlayingMovies, { reviews: latestReviews }] = await Promise.all([
    fetchNowPlayingMovies(),
    fetchReviewsPaginated({ page: 1, pageSize: 10 }),
  ]);

  if (!nowPlayingMovies?.length) {
    return notFound();
  }

  // 오늘의 추천 영화 선택 (예고편, 크레딧 포함)
  const { movie: recommendMovie, trailerKey, genres, uniqueDirectors } =
    await getRecommendMovie(nowPlayingMovies);

  return (
    <HomePage
      movieList={nowPlayingMovies}
      recommendMovie={recommendMovie}
      trailerKey={trailerKey}
      latestReviews={latestReviews}
      genres={genres}
      uniqueDirectors={uniqueDirectors}
    />
  );
}
