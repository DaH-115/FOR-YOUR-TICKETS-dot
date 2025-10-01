import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import {
  getCertification,
  normalizeCertification,
} from "lib/movies/utils/normalizeCertification";

describe("MovieReleaseDates Pure Functions", () => {
  describe("normalizeCertification", () => {
    it.each([
      ["15", "15"],
      ["12세관람가", "12"],
      ["all", "ALL"],
      ["PG-13", "15"],
      ["   R ", "18"],
      ["invalid-certification", "18"],
      [null, "18"],
      [undefined, "18"],
    ])("입력값 '%s'는(은) '%s'(으)로 정규화되어야 함", (input, expected) => {
      expect(normalizeCertification(input as string)).toBe(expected);
    });
  });

  describe("getCertification", () => {
    test("한국 등급이 있으면 한국 등급을 반환해야 함", () => {
      const mockData = {
        id: 1,
        results: [
          { iso_3166_1: "US", release_dates: [{ certification: "PG-13" }] },
          {
            iso_3166_1: "KR",
            release_dates: [{ certification: "15세관람가" }],
          },
        ],
      };
      expect(getCertification(mockData as any)).toBe("15");
    });

    test("한국 등급은 없고 미국 등급만 있으면 미국 등급을 반환해야 함", () => {
      const mockData = {
        id: 1,
        results: [
          { iso_3166_1: "US", release_dates: [{ certification: "R" }] },
          { iso_3166_1: "GB", release_dates: [{ certification: "12" }] },
        ],
      };
      expect(getCertification(mockData as any)).toBe("18");
    });

    test("한국과 미국 등급이 모두 없으면 null을 반환해야 함", () => {
      const mockData = {
        id: 1,
        results: [
          { iso_3166_1: "DE", release_dates: [{ certification: "16" }] },
        ],
      };
      expect(getCertification(mockData as any)).toBe(null);
    });

    test("results 배열이 비어있으면 null을 반환해야 함", () => {
      const mockData = { id: 1, results: [] };
      expect(getCertification(mockData as any)).toBe(null);
    });
  });
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("fetchMovieReleaseDates", () => {
  const mockMovieId = 202;
  const mockTmdbApiKey = "test-api-key";
  const mockApiResponse = {
    id: mockMovieId,
    results: [{ iso_3166_1: "KR", release_dates: [{ certification: "15" }] }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = mockTmdbApiKey;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });
  });

  test("성공: API를 호출하여 연령 등급 정보를 반환해야 함", async () => {
    const result = await fetchMovieReleaseDates(mockMovieId);
    expect(result).toEqual(mockApiResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("성공: Next.js 캐싱으로 동일한 결과를 반환해야 함", async () => {
    const result = await fetchMovieReleaseDates(mockMovieId);
    expect(result).toEqual(mockApiResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/movie/${mockMovieId}/release_dates`),
      expect.objectContaining({
        next: { revalidate: 86400 },
      }),
    );
  });

  test("실패: API 응답이 실패하면 에러를 던져야 함", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchMovieReleaseDates(mockMovieId)).rejects.toThrow(
      "영화 등급 정보를 불러올 수 없습니다.",
    );
  });
});
