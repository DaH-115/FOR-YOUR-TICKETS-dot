interface ReleaseDate {
  certification: string;
  meaning: string;
  release_date: string;
}

interface ReleaseDatesResult {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

interface MovieReleaseDates {
  id: number;
  results: ReleaseDatesResult[];
}

import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";

// 배치 처리 함수
// ✳️ 여러 개의 id가 담긴 배열을 받아, 이 모든 id에 대한 연령 등급 정보를 '가장 효율적으로' 가져오는 상위 레벨의 함수
// 성능 최적화: 중복 ID 제거 및 병렬 처리를 통해 네트워크 지연 시간을 획기적으로 줄입니다.
// 작업 조율 (Orchestration): 여러 개의 단일 작업을 효율적으로 관리하고 조율하는 역할을 합니다.
export async function fetchMultipleMovieReleaseDates(
  movieIds: number[],
  fetcher: (id: number) => Promise<MovieReleaseDates> = fetchMovieReleaseDates,
): Promise<Map<number, MovieReleaseDates | null>> {
  const results = new Map<number, MovieReleaseDates | null>();

  // 중복 ID 제거
  const uniqueIds = [...new Set(movieIds)];

  const promises = uniqueIds.map(async (id) => {
    try {
      // 각 id에 대해 fetcher를 호출합니다. Next.js 캐싱은 fetch 레벨에서 처리됩니다.
      const data = await fetcher(id);
      return { id, data, success: true };
    } catch (error: unknown) {
      console.error(`ID ${id}의 연령 등급 정보 조회 실패:`, error);
      return { id, data: null, success: false };
    }
  });

  // 모든 API 호출이 끝날 때까지 기다리기
  const apiResults = await Promise.all(promises);

  // 결과 정리하기
  for (const result of apiResults) {
    results.set(result.id, result.data);
  }

  return results;
}
