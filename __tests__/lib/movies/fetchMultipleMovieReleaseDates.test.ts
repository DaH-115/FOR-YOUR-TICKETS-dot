import { fetchMultipleMovieReleaseDates } from "lib/movies/fetchMultipleMovieReleaseDates";
import { fetchMovieReleaseDates } from "lib/movies/fetchMovieReleaseDates";
import { MovieReleaseDates } from "lib/movies/types/movieReleaseDates";

jest.mock("lib/movies/fetchMovieReleaseDates");

const mockFetchMovieReleaseDates =
  fetchMovieReleaseDates as jest.MockedFunction<typeof fetchMovieReleaseDates>;

describe("fetchMultipleMovieReleaseDates", () => {
  const mockResponse1: MovieReleaseDates = { id: 1, results: [] };
  const mockResponse2: MovieReleaseDates = { id: 2, results: [] };
  const mockResponse3: MovieReleaseDates = { id: 3, results: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMovieReleaseDates.mockImplementation(async (id: number) => {
      if (id === 1) return mockResponse1;
      if (id === 2) return mockResponse2;
      if (id === 3) return mockResponse3;
      throw new Error(`예상치 못한 ID: ${id}`);
    });
  });

  it("여러 영화의 등급 정보를 가져온다", async () => {
    const results = await fetchMultipleMovieReleaseDates([1, 2, 3]);

    expect(results.size).toBe(3);
    expect(results.get(1)).toEqual(mockResponse1);
    expect(results.get(2)).toEqual(mockResponse2);
    expect(results.get(3)).toEqual(mockResponse3);

    expect(mockFetchMovieReleaseDates).toHaveBeenCalledTimes(3);
  });

  it("중복된 ID는 한 번만 호출한다", async () => {
    const results = await fetchMultipleMovieReleaseDates([1, 2, 1, 3, 2, 1]);

    expect(results.size).toBe(3);
    expect(mockFetchMovieReleaseDates).toHaveBeenCalledTimes(3);
    expect(mockFetchMovieReleaseDates).toHaveBeenCalledWith(1);
    expect(mockFetchMovieReleaseDates).toHaveBeenCalledWith(2);
    expect(mockFetchMovieReleaseDates).toHaveBeenCalledWith(3);
  });

  it("에러가 발생해도 다른 영화는 계속 처리한다", async () => {
    mockFetchMovieReleaseDates.mockImplementation(async (id: number) => {
      if (id === 1) return mockResponse1;
      if (id === 2) throw new Error("API 실패");
      if (id === 3) return mockResponse3;
      throw new Error(`예상치 못한 ID: ${id}`);
    });

    const results = await fetchMultipleMovieReleaseDates([1, 2, 3]);

    expect(results.size).toBe(3);
    expect(results.get(1)).toEqual(mockResponse1);
    expect(results.get(2)).toBeNull(); // 에러 발생 시 null
    expect(results.get(3)).toEqual(mockResponse3);
  });
});
