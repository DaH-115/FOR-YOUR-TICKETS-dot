/**
 * TMDB API의 영화 등급 정보 타입 정의
 */

export interface ReleaseDate {
  certification: string;
  meaning: string;
  release_date: string;
}

export interface ReleaseDatesResult {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface MovieReleaseDates {
  id: number;
  results: ReleaseDatesResult[];
}
