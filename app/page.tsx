import { fetchNowPlayingMovies } from "lib/movies/fetchNowPlayingMovies";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { getRecommendMovie } from "lib/movies/getRecommendMovie";
import { notFound } from "next/navigation";
import HomePage from "@/home/HomePage";

export default async function Page() {
  // 상영 중인 영화 목록 조회
  const [nowPlayingMovies] = await Promise.all([
    fetchNowPlayingMovies(),
    fetchReviewsPaginated({ page: 1, pageSize: 10 }),
  ]);

  // 상영 중인 영화가 없으면 404 페이지 반환
  if (!nowPlayingMovies?.length) {
    return notFound();
  }

  // 오늘의 추천 영화 선택 (예고편, 크레딧 포함)
  const {
    movie: recommendMovie,
    genres,
    trailerKey,
    uniqueDirectors,
  } = await getRecommendMovie(nowPlayingMovies);

  const { reviews: latestReviews } = await fetchReviewsPaginated({
    page: 1,
    pageSize: 10,
  });

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
