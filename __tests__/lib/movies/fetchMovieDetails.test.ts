import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";
import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import { getCertification } from "lib/movies/utils/getCertification";

jest.mock("lib/movies/fetchMovieReleaseDates");
jest.mock("lib/movies/utils/getCertification");

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockedFetchMovieReleaseDates = fetchMovieReleaseDates as jest.Mock;
const mockedGetCertification = getCertification as jest.Mock;

describe("fetchMovieDetails", () => {
  const mockMovieId = 101;
  const mockTmdbApiKey = "test-api-key";
  const mockApiResponse = {
    id: mockMovieId,
    title: "Test Movie Details",
    genres: [{ id: 18, name: "드라마" }],
  };
  const mockCertification = "15";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = mockTmdbApiKey;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });
    mockedFetchMovieReleaseDates.mockResolvedValue({} as any);
    mockedGetCertification.mockReturnValue(mockCertification);
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
  });

  test("성공: 영화 상세 정보와 연령 등급을 함께 반환해야 함", async () => {
    const result = await fetchMovieDetails(mockMovieId);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.themoviedb.org/3/movie/${mockMovieId}?api_key=${mockTmdbApiKey}&language=ko-KR`,
      expect.any(Object),
    );
    expect(mockedFetchMovieReleaseDates).toHaveBeenCalledWith(mockMovieId);
    expect(mockedGetCertification).toHaveBeenCalled();
    expect(result).toEqual({
      ...mockApiResponse,
      certification: mockCertification,
    });
  });

  test("성공: 연령 등급 정보 조회 실패 시 certification은 null로 반환해야 함", async () => {
    mockedFetchMovieReleaseDates.mockRejectedValue(
      new Error("Failed to fetch release dates"),
    );

    const result = await fetchMovieDetails(mockMovieId);

    expect(result).toEqual({ ...mockApiResponse, certification: null });
  });

  test("실패: TMDB API 키가 없으면 에러를 던져야 함", async () => {
    delete process.env.TMDB_API_KEY;
    await expect(fetchMovieDetails(mockMovieId)).rejects.toThrow(
      "TMDB API 키가 설정되지 않았습니다.",
    );
  });

  test("실패: fetch 응답이 실패하면 에러를 던져야 함", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(fetchMovieDetails(mockMovieId)).rejects.toThrow(
      "영화 상세 정보를 불러올 수 없습니다.",
    );
  });
});
