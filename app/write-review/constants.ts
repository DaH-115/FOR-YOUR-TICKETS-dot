// 리뷰 작성/수정 관련 상수

/**
 * 사용자 활동 등급 목록
 */
export const USER_LEVELS = ["NEWBIE", "REGULAR", "ACTIVE", "EXPERT"] as const;

/**
 * 사용자 활동 등급 타입
 */
export type UserLevel = (typeof USER_LEVELS)[number];

/**
 * 리뷰 작성/수정 성공 메시지
 */
export const REVIEW_MESSAGES = {
  CREATE_SUCCESS: "리뷰가 성공적으로 생성되었습니다.",
  UPDATE_SUCCESS: "리뷰가 성공적으로 수정되었습니다.",
  ALERT_TITLE: "알림",
} as const;

/**
 * 리뷰 작성/수정 후 이동 경로
 */
export const REVIEW_REDIRECT_PATHS = {
  CREATE: "/ticket-list",
  UPDATE: "/",
} as const;
