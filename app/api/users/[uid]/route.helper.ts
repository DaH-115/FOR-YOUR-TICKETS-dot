/**
 * 사용자 API 헬퍼 함수
 *
 * [비정규화 배치 업데이트 제거 사유]
 * 리뷰/댓글 문서에 비정규화된 displayName, photoKey, activityLevel은
 * 조회 시점에 항상 users 컬렉션의 최신 데이터로 교체됩니다.
 * - fetchReviewsPaginated: addUserInfoToReviews()에서 users 조회 후 병합
 * - comments/get.handler: 댓글마다 users 컬렉션에서 최신 프로필 조회
 *
 * 따라서 프로필 변경 시 모든 리뷰/댓글을 배치 업데이트하는 것은
 * 불필요한 Firestore 쓰기 비용이며, Vercel Serverless 환경에서
 * 응답 후 백그라운드 작업도 보장되지 않습니다.
 */

/**
 * S3 key를 완전한 URL로 변환합니다.
 */
export function getS3Url(key: string): string {
  const bucketName = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "ap-northeast-2";
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
