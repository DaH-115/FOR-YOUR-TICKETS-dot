import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import {
  getCertification,
  normalizeCertification,
} from "lib/movies/utils/getCertification";
import { MovieReleaseDates } from "lib/movies/types/movieReleaseDates";

describe("normalizeCertification", () => {
  it("한국 등급을 정규화한다", () => {
    expect(normalizeCertification("12세관람가")).toBe("12");
    expect(normalizeCertification("15세관람가")).toBe("15");
    expect(normalizeCertification("전체관람가")).toBe("ALL");
  });

  it("미국 등급을 한국 등급으로 매핑한다", () => {
    expect(normalizeCertification("PG-13")).toBe("15");
    expect(normalizeCertification("R")).toBe("18");
    expect(normalizeCertification("PG")).toBe("12");
  });

  it("공백을 제거하고 처리한다", () => {
    expect(normalizeCertification("  R  ")).toBe("18");
  });

  it("유효하지 않은 입력은 null을 반환한다", () => {
    expect(normalizeCertification("")).toBe(null);
    expect(normalizeCertification("invalid")).toBe(null);
  });
});

describe("getCertification", () => {
  it("한국 등급이 있으면 한국 등급을 반환한다", () => {
    const data: MovieReleaseDates = {
      id: 1,
      results: [
        {
          iso_3166_1: "US",
          release_dates: [
            { certification: "PG-13", meaning: "", release_date: "" },
          ],
        },
        {
          iso_3166_1: "KR",
          release_dates: [
            { certification: "15세관람가", meaning: "", release_date: "" },
          ],
        },
      ],
    };
    expect(getCertification(data)).toBe("15");
  });

  it("한국 등급이 없으면 미국 등급을 반환한다", () => {
    const data: MovieReleaseDates = {
      id: 1,
      results: [
        {
          iso_3166_1: "US",
          release_dates: [
            { certification: "R", meaning: "", release_date: "" },
          ],
        },
      ],
    };
    expect(getCertification(data)).toBe("18");
  });

  it("한국과 미국 등급이 모두 없으면 null을 반환한다", () => {
    const data: MovieReleaseDates = {
      id: 1,
      results: [
        {
          iso_3166_1: "DE",
          release_dates: [
            { certification: "16", meaning: "", release_date: "" },
          ],
        },
      ],
    };
    expect(getCertification(data)).toBe(null);
  });

  it("빈 results 배열이면 null을 반환한다", () => {
    const data: MovieReleaseDates = { id: 1, results: [] };
    expect(getCertification(data)).toBe(null);
  });
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("fetchMovieReleaseDates", () => {
  const movieId = 202;
  const apiKey = "test-api-key";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = apiKey;
  });

  it("영화 등급 정보를 성공적으로 가져온다", async () => {
    const mockResponse: MovieReleaseDates = {
      id: movieId,
      results: [
        {
          iso_3166_1: "KR",
          release_dates: [
            { certification: "15", meaning: "", release_date: "" },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchMovieReleaseDates(movieId);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/movie/${movieId}/release_dates`),
      expect.objectContaining({ cache: "force-cache" }),
    );
  });

  it("API 키가 없으면 에러를 던진다", async () => {
    delete process.env.TMDB_API_KEY;

    await expect(fetchMovieReleaseDates(movieId)).rejects.toThrow(
      "TMDB API 키가 설정되지 않았습니다.",
    );
  });

  it("유효하지 않은 영화 ID면 에러를 던진다", async () => {
    await expect(fetchMovieReleaseDates(0)).rejects.toThrow(
      "유효하지 않은 영화 ID입니다.",
    );
    await expect(fetchMovieReleaseDates(-1)).rejects.toThrow(
      "유효하지 않은 영화 ID입니다.",
    );
  });

  it("API 호출이 실패하면 에러를 던진다", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchMovieReleaseDates(movieId)).rejects.toThrow(
      "영화 등급 정보를 불러올 수 없습니다.",
    );
  });
});
