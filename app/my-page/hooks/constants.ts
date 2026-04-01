// 비밀번호 변경 관련 상수

export const PASSWORD_CHANGE_MESSAGES = {
  ALERT_TITLE: "비밀번호 변경",
  VERIFY: {
    ERROR: {
      NO_USER: "사용자 정보가 올바르지 않습니다.",
      NOT_LOGGED_IN: "사용자가 로그인되어 있지 않습니다.",
    },
  },
  UPDATE: {
    SUCCESS: "비밀번호가 성공적으로 변경되었습니다.",
    ERROR: {
      NOT_VERIFIED: "먼저 현재 비밀번호를 확인해주세요.",
    },
  },
} as const;

export const PASSWORD_CHANGE_REDIRECT_PATH = "/login";
