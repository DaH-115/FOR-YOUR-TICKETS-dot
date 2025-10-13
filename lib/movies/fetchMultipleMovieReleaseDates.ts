import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import { MovieReleaseDates } from "lib/movies/types/movieReleaseDates";

/**
 * 여러 영화의 연령 등급 정보를 배치로 가져옵니다.
 * - 중복 ID 제거
 * - 병렬 처리로 성능 최적화
 * - 에러 발생 시에도 다른 영화 정보는 계속 처리
 */
export async function fetchMultipleMovieReleaseDates(
  movieIds: number[],
): Promise<Map<number, MovieReleaseDates | null>> {
  const results = new Map<number, MovieReleaseDates | null>();

  // 중복 ID 제거
  const uniqueIds = [...new Set(movieIds)];

  const promises = uniqueIds.map(async (id) => {
    try {
      const data = await fetchMovieReleaseDates(id);
      return { id, data };
    } catch (error: unknown) {
      console.error(`ID ${id}의 연령 등급 정보 조회 실패:`, error);
      return { id, data: null };
    }
  });

  // 모든 API 호출이 끝날 때까지 기다리기
  const apiResults = await Promise.all(promises);

  // 결과를 Map으로 변환
  for (const result of apiResults) {
    results.set(result.id, result.data);
  }

  return results;
}
