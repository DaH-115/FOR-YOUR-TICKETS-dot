import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import { getCertification } from "lib/movies/utils/getCertification";
import type { MovieDetails } from "types/movie";

// 타입 re-export (하위 호환성 유지)
export type { MovieDetails } from "types/movie";

export async function fetchMovieDetails(id: number): Promise<MovieDetails> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    throw new Error("TMDB API 키가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=ko-KR`,
    { cache: "force-cache" },
  );

  if (!response.ok) {
    throw new Error("영화 상세 정보를 불러올 수 없습니다.");
  }

  const data = await response.json();

  // 연령등급 정보 가져오기
  try {
    const releaseDates = await fetchMovieReleaseDates(id);
    const certification = getCertification(releaseDates);
    data.certification = certification ?? null;
  } catch (error) {
    console.error("연령등급 정보를 가져오는데 실패했습니다:", error);
    data.certification = null;
  }

  return data;
}
