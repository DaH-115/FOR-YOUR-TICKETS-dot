// 리뷰 작성/수정 관련 상수

// 사용자 등급 타입 re-export (하위 호환성 유지)
export { USER_LEVELS } from "types/user";
export type { UserLevel } from "types/user";

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
