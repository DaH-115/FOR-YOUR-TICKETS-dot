/**
 * 영화 관련 타입 정의
 * - TMDB API 응답 기반 타입
 * - 프로젝트 전역에서 사용
 */

// TMDB 영화 기본 정보 (상세 정보의 베이스)
export interface MovieBaseType {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date: string;
  vote_average: number;
  runtime: string;
  production_companies: { id: number; name: string }[];
}

// TMDB 영화 목록 아이템 (상영 중, 트렌딩, 유사 영화 등)
export interface MovieList {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  genres?: string[];
  certification?: string | null;
}

// 영화 상세 정보 (장르, 연령등급 포함)
export interface MovieDetails extends MovieBaseType {
  genres: { id: number; name: string }[];
  certification?: string | null;
}

// 출연진 정보
export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  gender: number;
  profile_path: string | null;
  cast_id: number;
  credit_id: string;
  adult: boolean;
  order: number;
  popularity: number;
  known_for_department: string;
}

// 제작진 정보
export interface CrewMember {
  id: number;
  job: string;
  name: string;
  original_name: string;
  profile_path: string | null;
  gender: number;
  adult: boolean;
  credit_id: string;
  department: string;
  known_for_department: string;
  popularity: number;
}

// 출연진/제작진 통합 타입
export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}
