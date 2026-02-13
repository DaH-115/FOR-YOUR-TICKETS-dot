/**
 * 인증 관련 타입 정의
 * - Firebase Admin SDK 기반 토큰 검증 결과 타입
 * - API Route에서 사용
 */

export interface AuthResult {
  success: boolean;
  uid?: string;
  email?: string;
  error?: string;
  statusCode?: number;
}
