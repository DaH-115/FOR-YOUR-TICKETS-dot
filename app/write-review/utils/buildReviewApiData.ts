import type { User } from "store/redux-toolkit/slice/userSlice";
import type { MovieDetails } from "lib/movies/fetchMovieDetails";
import type { ReviewFormValues } from "app/write-review/types";
import type { ReviewApiData } from "app/utils/api/postReview";

/**
 * 리뷰 작성 API 데이터를 생성하는 유틸 함수
 * - 사용자 정보, 영화 정보, 폼 데이터를 조합하여 API 요청 데이터 생성
 *
 * @param userState - 현재 로그인한 사용자 정보
 * @param movieData - 리뷰 대상 영화 상세 정보
 * @param formData - 리뷰 폼 입력 데이터
 * @returns API 요청용 리뷰 데이터
 */
export function buildReviewApiData(
  userState: User,
  movieData: MovieDetails,
  formData: ReviewFormValues,
): ReviewApiData {
  return {
    user: {
      uid: userState.uid,
      displayName: userState.displayName,
      photoKey: userState.photoKey,
    },
    review: {
      movieId: movieData.id,
      movieTitle: movieData.title,
      originalTitle: movieData.original_title,
      moviePosterPath: movieData.poster_path,
      releaseYear: movieData.release_date.slice(0, 4),
      rating: formData.rating,
      reviewTitle: formData.reviewTitle,
      reviewContent: formData.reviewContent,
      likeCount: 0,
      isLiked: false,
    },
  };
}
