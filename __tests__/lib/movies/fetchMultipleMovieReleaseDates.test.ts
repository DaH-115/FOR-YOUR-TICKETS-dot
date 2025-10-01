import { fetchMultipleMovieReleaseDates } from "lib/movies/fetchMultipleMovieReleaseDates";

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

jest.mock("lib/movies/fetchMovieReleaseDates");

describe("fetchMultipleMovieReleaseDates", () => {
  const mockMovieIds = [1, 2, 3];
  const mockApiResponse1 = { id: 1, results: [] };
  const mockApiResponse2 = { id: 2, results: [] };
  const mockApiResponse3 = { id: 3, results: [] };

  // 테스트에서 사용할 간단한 가짜 fetcher 함수를 만듭니다.
  const mockFetcher = jest.fn<Promise<MovieReleaseDates>, [number]>();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = "test-key";

    // 가짜 fetcher가 어떻게 동작할지 정의합니다.
    mockFetcher.mockImplementation(async (id: number) => {
      if (id === 1) return mockApiResponse1;
      if (id === 2) return mockApiResponse2;
      if (id === 3) return mockApiResponse3;
      throw new Error("테스트에서 예상치 못한 ID가 호출되었습니다.");
    });
  });

  test("제공된 fetcher를 사용하여 모든 영화의 데이터를 가져와야 합니다.", async () => {
    // 테스트 대상 함수에 가짜 fetcher를 직접 주입합니다.
    const results = await fetchMultipleMovieReleaseDates(
      mockMovieIds,
      mockFetcher,
    );

    // 결과 검증
    expect(results.size).toBe(3);
    expect(results.get(1)).toEqual(mockApiResponse1);
    expect(results.get(2)).toEqual(mockApiResponse2);
    expect(results.get(3)).toEqual(mockApiResponse3);

    // 가짜 함수 호출 검증
    expect(mockFetcher).toHaveBeenCalledTimes(3);
    expect(mockFetcher).toHaveBeenCalledWith(1);
    expect(mockFetcher).toHaveBeenCalledWith(2);
    expect(mockFetcher).toHaveBeenCalledWith(3);
  });

  test("중복된 ID가 있어도 한 번씩만 fetcher를 호출해야 합니다.", async () => {
    // 중복 ID가 포함된 배열
    const duplicatedIds = [1, 2, 1, 3, 2, 1];

    const results = await fetchMultipleMovieReleaseDates(
      duplicatedIds,
      mockFetcher,
    );

    // 결과 검증 - 중복 제거된 3개의 고유 ID만 처리
    expect(results.size).toBe(3);
    expect(results.get(1)).toEqual(mockApiResponse1);
    expect(results.get(2)).toEqual(mockApiResponse2);
    expect(results.get(3)).toEqual(mockApiResponse3);

    // 중복 제거로 인해 각 ID당 한 번씩만 호출
    expect(mockFetcher).toHaveBeenCalledTimes(3);
    expect(mockFetcher).toHaveBeenCalledWith(1);
    expect(mockFetcher).toHaveBeenCalledWith(2);
    expect(mockFetcher).toHaveBeenCalledWith(3);
  });
});
