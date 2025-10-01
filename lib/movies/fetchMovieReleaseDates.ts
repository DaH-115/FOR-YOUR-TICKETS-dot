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

// ✳️ 해당 id에 대한 연령 등급 정보만 가져오는 단일 목적 함수
// 기본 작업 단위: 특정 영화 하나의 등급 정보를 가져오는 가장 기본적인(atomic) 함수입니다.
// 재사용성: 이 함수는 다른 곳에서 "영화 하나의 등급 정보가 필요할 때" 언제든지 가져다 쓸 수 있는 부품(building block) 역할을 합니다.
export async function fetchMovieReleaseDates(
  id: number,
): Promise<MovieReleaseDates> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    throw new Error("TMDB API 키가 설정되지 않았습니다.");
  }

  if (!id || id <= 0) {
    throw new Error("유효하지 않은 영화 ID입니다.");
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${TMDB_API_KEY}`,
      {
        next: { revalidate: 86400 }, // 24시간 캐시
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`영화 ID ${id}에 대한 등급 정보를 찾을 수 없습니다.`);
      } else if (response.status === 401) {
        throw new Error("TMDB API 인증에 실패했습니다.");
      } else if (response.status === 429) {
        throw new Error(
          "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        );
      } else {
        throw new Error(
          `영화 등급 정보를 불러올 수 없습니다. (상태: ${response.status})`,
        );
      }
    }

    const data = await response.json();

    if (!data || !data.results) {
      throw new Error("영화 등급 정보가 올바르지 않습니다.");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
}
