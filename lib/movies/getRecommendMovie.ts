import { fetchVideosMovies } from "lib/movies/fetchVideosMovies";
import { fetchMovieCredits } from "lib/movies/fetchMovieCredits";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";
import type { MovieList, CrewMember } from "types/movie";

interface RecommendMovieResult {
  /** 추천 영화 (상세 정보 포함) */
  movie: MovieList;
  /** 예고편 YouTube 키 */
  trailerKey: string;
  /** 장르 이름 배열 */
  genres: string[];
  /** 중복 제거된 감독 목록 */
  uniqueDirectors: CrewMember[];
}

/**
 * 상영 중인 영화 목록에서 오늘의 추천 영화를 선택합니다.
 * - 예고편이 있는 영화 우선 선택
 * - 영화 상세 정보, 크레딧 데이터를 함께 조회
 *
 * @param movies - 상영 중인 영화 목록
 * @returns 추천 영화 정보 (영화 데이터, 예고편 키, 장르, 감독)
 */
export async function getRecommendMovie(
  movies: MovieList[],
): Promise<RecommendMovieResult> {
  // 매일 다른 추천 영화 선택 (SSR 안전한 날짜 기반 로직)
  const today = new Date().getDate();
  const startIndex = today % movies.length;

  // 예고편이 있는 영화를 찾을 때까지 순회
  let recommendMovie = movies[startIndex];
  let trailerKey = "";

  for (let attempts = 0; attempts < movies.length; attempts++) {
    const currentIndex = (startIndex + attempts) % movies.length;
    const currentMovie = movies[currentIndex];
    const trailerData = await fetchVideosMovies(currentMovie.id);

    if (trailerData?.results?.[0]?.key) {
      recommendMovie = currentMovie;
      trailerKey = trailerData.results[0].key;
      break;
    }
  }

  // 예고편이 있는 영화가 없는 경우, 첫 번째 영화 사용 (fallback)
  if (!trailerKey) {
    recommendMovie = movies[startIndex];
  }

  // 크레딧 및 상세 정보 병렬 조회
  const [credits, movieDetails] = await Promise.all([
    fetchMovieCredits(recommendMovie.id),
    fetchMovieDetails(recommendMovie.id),
  ]);

  // 장르 정보 추출
  const genres =
    movieDetails.genres?.map((genre) => genre.name) ||
    recommendMovie.genres ||
    [];

  // 감독 정보 추출 (중복 제거)
  const uniqueDirectors = credits.crew
    .filter((person) => person.job === "Director")
    .reduce<CrewMember[]>((unique, person) => {
      if (!unique.some((p) => p.name === person.name)) {
        unique.push(person);
      }
      return unique;
    }, []);

  // 상세 정보와 병합
  const movie = {
    ...recommendMovie,
    ...movieDetails,
    genres,
  };

  return { movie, trailerKey, genres, uniqueDirectors };
}
