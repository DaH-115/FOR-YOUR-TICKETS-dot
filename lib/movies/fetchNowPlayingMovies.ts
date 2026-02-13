import { enrichMovieData } from "lib/movies/utils/enrichMovieData";
import type { MovieList } from "types/movie";

// 타입 re-export (하위 호환성 유지)
export type { MovieBaseType, MovieList } from "types/movie";

export async function fetchNowPlayingMovies(): Promise<MovieList[]> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    throw new Error("TMDB API 키가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&include_adult=true&language=ko-KR`,
    {
      next: { revalidate: 86400 }, // 24시간(86400초) 간격으로 재검증
    },
  );

  if (!response.ok) {
    throw new Error("상영 중인 영화를 불러올 수 없습니다.");
  }

  const data = await response.json();

  return enrichMovieData(data.results);
}
