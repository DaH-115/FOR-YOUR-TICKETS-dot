import type { MovieCredits } from "types/movie";

// 타입 re-export (하위 호환성 유지)
export type { CastMember, CrewMember, MovieCredits } from "types/movie";

export async function fetchMovieCredits(id: number): Promise<MovieCredits> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    throw new Error("TMDB API 키가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=ko-KR`,
    { next: { revalidate: 86400 } }, // 24시간 캐시
  );

  if (!response.ok) {
    throw new Error("영화 출연진 정보를 불러올 수 없습니다.");
  }

  const data = await response.json();
  return data;
}
