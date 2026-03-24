import { GET } from "app/api/tmdb/movies/route";
import { NextRequest } from "next/server";
import { fetchGenres } from "lib/movies/fetchGenres";

jest.mock("lib/movies/fetchGenres");
const mockFetch = jest.fn();
global.fetch = mockFetch;
const mockedFetchGenres = fetchGenres as jest.Mock;

describe("GET /api/tmdb/movies", () => {
  const mockTmdbApiKey = "test-tmdb-api-key";
  const mockGenreMap = { 28: "Action", 12: "Adventure" };
  const mockQuery = "test movie";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = mockTmdbApiKey;
    mockedFetchGenres.mockResolvedValue(mockGenreMap);
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
  });

  test("성공: 유효한 검색어로 영화 목록과 장르 정보를 반환해야 함", async () => {
    // 정상적으로 TMDB API와 장르 API가 모두 성공하는 경우
    const mockTmdbResponse = {
      results: [
        { id: 1, title: "Test Movie 1", genre_ids: [28] },
        { id: 2, title: "Test Movie 2", genre_ids: [12, 28] },
        { id: 3, title: "Test Movie 3", genre_ids: [99] },
        { id: 4, title: "Test Movie 4", genre_ids: null },
      ],
      total_pages: 1,
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTmdbResponse),
    });
    const req = new NextRequest(
      `http://localhost/api/tmdb/movies?query=${mockQuery}&page=1`,
    );
    const response = await GET(req);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.movies).toHaveLength(4);
    expect(body.totalPages).toBe(1);
    expect(body.movies[0].genres).toEqual(["Action"]);
    expect(body.movies[1].genres).toEqual(["Adventure", "Action"]);
    expect(body.movies[2].genres).toEqual([]);
    expect(body.movies[3].genres).toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`query=${encodeURIComponent(mockQuery)}`),
      expect.any(Object),
    );
    expect(mockedFetchGenres).toHaveBeenCalledTimes(1);
  });

  test("실패: query 파라미터가 없으면 400 에러를 반환해야 함", async () => {
    // query 파라미터가 없을 때 400 반환
    const req = new NextRequest("http://localhost/api/tmdb/movies");
    const response = await GET(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("잘못된 요청입니다.");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("실패: TMDB API가 에러를 반환하면 해당 상태 코드를 반환해야 함", async () => {
    // TMDB API에서 에러 응답이 올 때 해당 상태 코드와 메시지 반환
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Invalid API key"),
    });
    const req = new NextRequest(
      `http://localhost/api/tmdb/movies?query=${mockQuery}`,
    );
    const response = await GET(req);
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe("TMDB 검색 요청 실패");
  });

  test("실패: fetch 중 네트워크 에러가 발생하면 500 에러를 반환해야 함", async () => {
    // fetch 함수에서 네트워크 에러 발생 시 500 반환
    mockFetch.mockRejectedValue(new Error("Network error"));
    const req = new NextRequest(
      `http://localhost/api/tmdb/movies?query=${mockQuery}`,
    );
    const response = await GET(req);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("서버 오류로 영화 검색에 실패했습니다.");
  });
});
