/**
 * 리뷰 관련 타입 정의
 * - Firestore 리뷰 문서 기반 타입
 * - 프로젝트 전역에서 사용
 */

import type { MovieDetails } from "./movie";

// 리뷰 작성자 정보
export interface ReviewUser {
  uid: string | null;
  displayName: string | null;
  photoKey: string | null;
  activityLevel?: string;
}

// API에서 반환하는 리뷰 문서 타입 (날짜는 ISO 문자열)
export interface ReviewDoc {
  id: string;
  user: ReviewUser;
  review: {
    movieId: number;
    movieTitle: string;
    originalTitle: string;
    moviePosterPath?: string;
    releaseYear: string;
    rating: number;
    reviewTitle: string;
    reviewContent: string;
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    // 목록에서는 사용자 컨텍스트가 없어 미확정 상태일 수 있음
    isLiked?: boolean;
  };
  /** 전역 순번(오래된 글이 1). 작성 시 Firestore에 기록 */
  orderNumber?: number;
}

// 리뷰 작성/수정 폼 데이터 타입
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
