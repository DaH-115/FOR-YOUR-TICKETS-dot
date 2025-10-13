import { fetchGenres } from "lib/movies/fetchGenres";
import { fetchMultipleMovieReleaseDates } from "lib/movies/fetchMultipleMovieReleaseDates";
import { getCertification } from "lib/movies/utils/getCertification";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

// 영화 목록에 장르와 관람 등급 정보를 추가하는 공통 함수
export async function enrichMovieData(
  movies: MovieList[],
): Promise<MovieList[]> {
  if (!movies || movies.length === 0) {
    return [];
  }

  const [genreMap, certificationsMap] = await Promise.all([
    fetchGenres(),
    fetchMultipleMovieReleaseDates(movies.map((movie) => movie.id)),
  ]);

  return movies.map((movie) => {
    const certificationData = certificationsMap.get(movie.id);
    const certification = certificationData
      ? getCertification(certificationData)
      : null;
    const genres =
      movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [];

    return { ...movie, genres, certification };
  });
}
