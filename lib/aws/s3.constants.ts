/**
 * S3 관련 상수 정의
 */

// Presigned URL 만료 시간 (초)
export const S3_PRESIGNED_URL_EXPIRY = {
  DOWNLOAD: 3600, // 1시간 (다운로드용)
  UPLOAD: 300, // 5분 (업로드용)
} as const;

// S3에서 허용하는 경로 접두사
export const ALLOWED_S3_PATHS = ["profile-img/"] as const;

/**
 * S3 키가 허용된 경로인지 검증
 * - 경로 정규화 후 검증하여 Path Traversal 공격 방지
 */
export function isAllowedS3Path(key: string): boolean {
  // 1. 빈 문자열 거부
  if (!key || typeof key !== "string") {
    return false;
  }

  // 2. Path Traversal 패턴 거부 (.. 포함)
  if (key.includes("..")) {
    return false;
  }

  // 3. 절대 경로 거부 (/ 로 시작)
  if (key.startsWith("/")) {
    return false;
  }

  // 4. 경로 정규화 (연속된 슬래시 제거)
  const normalizedKey = key.replace(/\/+/g, "/");

  // 5. 허용된 접두사로 시작하는지 확인
  return ALLOWED_S3_PATHS.some((prefix) => normalizedKey.startsWith(prefix));
}

/**
 * S3 버킷 이름 가져오기 (환경변수 검증 포함)
 */
export function getS3BucketName(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("환경변수 AWS_S3_BUCKET이 설정되지 않았습니다.");
  }
  return bucket;
}

/**
 * S3 Presigned URL TTL 가져오기 (환경변수 또는 기본값)
 */
export function getS3DownloadTTL(): number {
  const ttl = process.env.S3_DOWNLOAD_URL_TTL;
  return ttl ? parseInt(ttl, 10) : S3_PRESIGNED_URL_EXPIRY.DOWNLOAD;
}
