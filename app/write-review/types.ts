import type { MovieDetails } from "lib/movies/fetchMovieDetails";

// 리뷰 작성 폼 데이터 타입
export interface ReviewFormValues {
  reviewTitle: string;
  reviewContent: string;
  rating: number;
  isLiked: boolean;
}

// 리뷰 모드 타입 (작성/수정)
export type ReviewMode = "new" | "edit";

// 리뷰 데이터 로딩 훅 파라미터
export interface UseReviewDataParams {
  mode: ReviewMode;
  reviewId?: string;
}

// 리뷰 폼 훅 파라미터
export interface UseReviewFormParams {
  mode: ReviewMode;
  reviewId?: string;
  movieData: MovieDetails;
}
