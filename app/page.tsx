import HomePage from "@/home/HomePage";
import { fetchNowPlayingMovies } from "lib/movies/fetchNowPlayingMovies";
import { fetchVideosMovies } from "lib/movies/fetchVideosMovies";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { notFound } from "next/navigation";
import { fetchMovieCredits } from "lib/movies/fetchMovieCredits";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";
import { MovieDetailsProvider } from "store/context/movieDetailsContext";

export default async function Page() {
  const [nowPlayingMovies, { reviews: latestReviews }] = await Promise.all([
    fetchNowPlayingMovies(),
    fetchReviewsPaginated({ page: 1, pageSize: 10 }),
  ]);

  if (!nowPlayingMovies?.length) {
    return notFound();
  }

  // 매일 다른 추천 영화 선택 (SSR 안전한 날짜 기반 로직)
  // 예고편이 있는 영화만 선택
  const today = new Date().getDate();
  const startIndex = today % nowPlayingMovies.length;

  let recommendMovie = nowPlayingMovies[startIndex];
  let trailerKey = "";
  let attempts = 0;
  const maxAttempts = nowPlayingMovies.length;

  // 예고편이 있는 영화를 찾을 때까지 순회
  while (attempts < maxAttempts) {
    const currentIndex = (startIndex + attempts) % nowPlayingMovies.length;
    const currentMovie = nowPlayingMovies[currentIndex];
    const trailerData = await fetchVideosMovies(currentMovie.id);

    if (trailerData?.results?.[0]?.key) {
      recommendMovie = currentMovie;
      trailerKey = trailerData.results[0].key;
      break;
    }

    attempts++;
  }

  // 예고편이 있는 영화가 없는 경우, 첫 번째 영화 사용 (fallback)
  if (!trailerKey) {
    recommendMovie = nowPlayingMovies[startIndex];
  }

  const [credits, movieDetails] = await Promise.all([
    fetchMovieCredits(recommendMovie.id),
    fetchMovieDetails(recommendMovie.id),
  ]);

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
        latestReviews={latestReviews}
      />
    </MovieDetailsProvider>
  );
}
