import HomePage from "app/home/HomePage";
import { fetchNowPlayingMovies } from "lib/movies/fetchNowPlayingMovies";
import { fetchTrendingMovies } from "lib/movies/fetchTrendingMovies";
import { fetchVideosMovies } from "lib/movies/fetchVideosMovies";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { notFound } from "next/navigation";
import { fetchMovieCredits } from "lib/movies/fetchMovieCredits";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";
import { MovieDetailsProvider } from "store/context/movieDetailsContext";

export default async function Page() {
  const [nowPlayingMovies, trendingMovies, { reviews: latestReviews }] =
    await Promise.all([
      fetchNowPlayingMovies(),
      fetchTrendingMovies(),
      fetchReviewsPaginated({ page: 1, pageSize: 10 }),
    ]);

  if (!nowPlayingMovies?.length) {
    return notFound();
  }

  // 매일 다른 추천 영화 선택 (SSR 안전한 날짜 기반 로직)
  // 1-31일 날짜를 영화 배열 길이로 나눈 나머지로 인덱스 결정
  const today = new Date().getDate();
  const recommendIndex = today % nowPlayingMovies.length;
  const recommendMovie = nowPlayingMovies[recommendIndex];

  const [trailerData, credits, movieDetails] = await Promise.all([
    fetchVideosMovies(recommendMovie.id),
    fetchMovieCredits(recommendMovie.id),
    fetchMovieDetails(recommendMovie.id),
  ]);

  const trailerKey = trailerData?.results?.[0]?.key || "";

  const recommendMovieWithDetails = {
    ...recommendMovie,
    ...movieDetails,
    genres:
      movieDetails.genres?.map((genre) => genre.name) || recommendMovie.genres,
  };

  return (
    <MovieDetailsProvider
      credits={credits}
      genres={recommendMovieWithDetails.genres}
    >
      <HomePage
        movieList={nowPlayingMovies}
        recommendMovie={recommendMovieWithDetails}
        trailerKey={trailerKey}
        trendingMovies={trendingMovies}
        latestReviews={latestReviews}
      />
    </MovieDetailsProvider>
  );
}
