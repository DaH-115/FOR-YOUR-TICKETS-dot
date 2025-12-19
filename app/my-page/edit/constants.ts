// 프로필 편집 관련 상수

export const PROFILE_EDIT_MESSAGES = {
  ALERT_TITLE: "프로필 수정",
  SUCCESS: "프로필이 업데이트되었습니다.",
  ERROR: {
    LOGIN_REQUIRED: "로그인이 필요합니다.",
    UPDATE_FAILED: "프로필 업데이트에 실패했습니다.",
    IMAGE_UPLOAD_PREPARE_FAILED: "이미지 업로드 준비에 실패했습니다.",
    IMAGE_UPLOAD_FAILED: "이미지 업로드에 실패했습니다.",
    USER_NOT_FOUND: "현재 사용자 정보를 찾을 수 없습니다.",
    DUPLICATE_CHECK_REQUIRED: "닉네임 중복 확인이 필요합니다.",
  },
  CONFIRM: {
    UNSAVED_CHANGES: "변경사항이 저장되지 않습니다. 정말 나가시겠습니까?",
  },
} as const;

export const PROFILE_EDIT_REDIRECT_PATH = "/my-page";
