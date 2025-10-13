import { S3Client } from "@aws-sdk/client-s3";

/**
 * AWS 환경변수 검증 및 반환
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}

/**
 * S3 클라이언트 싱글톤 인스턴스
 * - 환경변수 검증 후 생성
 */
const s3 = new S3Client({
  region: getRequiredEnv("AWS_REGION"),
  credentials: {
    accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

export default s3;
