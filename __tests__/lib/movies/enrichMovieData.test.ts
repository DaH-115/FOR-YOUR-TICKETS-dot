import { enrichMovieData } from "lib/movies/utils/enrichMovieData";
import { fetchGenres } from "lib/movies/fetchGenres";
import { fetchMultipleMovieReleaseDates } from "lib/movies/fetchMultipleMovieReleaseDates";
import { getCertification } from "lib/movies/utils/getCertification";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

jest.mock("lib/movies/fetchGenres");
jest.mock("lib/movies/fetchMultipleMovieReleaseDates");
jest.mock("lib/movies/utils/getCertification");

const mockedFetchGenres = fetchGenres as jest.Mock;
const mockedFetchMultipleMovieReleaseDates =
  fetchMultipleMovieReleaseDates as jest.Mock;
const mockedGetCertification = getCertification as jest.Mock;

describe("enrichMovieData", () => {
  const mockMovies = [
    { id: 1, title: "Movie 1", genre_ids: [28, 12] },
    { id: 2, title: "Movie 2", genre_ids: [80] },
  ];

  const mockGenreMap = {
    28: "액션",
    12: "모험",
    80: "범죄",
  };

  const mockCertificationsMap = new Map([
    [
      1,
      {
        id: 1,
        results: [
          { iso_3166_1: "KR", release_dates: [{ certification: "15" }] },
        ],
      },
    ],
    [
      2,
      {
        id: 2,
        results: [
          { iso_3166_1: "KR", release_dates: [{ certification: "18" }] },
        ],
      },
    ],
  ]);

  beforeEach(() => {
    mockedFetchGenres.mockResolvedValue(mockGenreMap);
    mockedFetchMultipleMovieReleaseDates.mockResolvedValue(
      mockCertificationsMap,
    );
    mockedGetCertification.mockImplementation((certificationData) => {
      if (certificationData.id === 1) return "15";
      if (certificationData.id === 2) return "18";
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("성공: 영화 목록에 장르와 관람 등급 정보를 추가해야 함", async () => {
    const enrichedMovies = await enrichMovieData(mockMovies as MovieList[]);

    expect(enrichedMovies).toHaveLength(2);
    expect(enrichedMovies[0].genres).toEqual(["액션", "모험"]);
    expect(enrichedMovies[0].certification).toBe("15");
    expect(enrichedMovies[1].genres).toEqual(["범죄"]);
    expect(enrichedMovies[1].certification).toBe("18");

    expect(mockedFetchGenres).toHaveBeenCalledTimes(1);
    expect(mockedFetchMultipleMovieReleaseDates).toHaveBeenCalledWith([1, 2]);
    expect(mockedGetCertification).toHaveBeenCalledTimes(2);
    expect(mockedGetCertification).toHaveBeenCalledWith(
      mockCertificationsMap.get(1),
    );
    expect(mockedGetCertification).toHaveBeenCalledWith(
      mockCertificationsMap.get(2),
    );
  });

  test("입력 배열이 비어있으면 빈 배열을 반환해야 함", async () => {
    const result = await enrichMovieData([]);
    expect(result).toEqual([]);
    expect(mockedFetchGenres).not.toHaveBeenCalled();
    expect(mockedFetchMultipleMovieReleaseDates).not.toHaveBeenCalled();
    expect(mockedGetCertification).not.toHaveBeenCalled();
  });
});
