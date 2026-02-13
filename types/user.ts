/**
 * 사용자 관련 타입 정의
 * - Firebase Auth + Firestore 기반 타입
 * - 프로젝트 전역에서 사용
 */

// 사용자 정보 타입 정의
export interface User {
  // Firebase Auth 정보
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoKey: string | null; // S3 이미지 Key만 사용합니다.

  // Firestore 메타데이터
  biography: string | null;
  provider: string | null;
  activityLevel: string;
  createdAt: string;
  updatedAt: string;

  // 사용자 통계 정보
  myTicketsCount: number;
  likedTicketsCount: number;
}

/**
 * 사용자 활동 등급 목록
 */
export const USER_LEVELS = ["NEWBIE", "REGULAR", "ACTIVE", "EXPERT"] as const;

/**
 * 사용자 활동 등급 타입
 */
export type UserLevel = (typeof USER_LEVELS)[number];
