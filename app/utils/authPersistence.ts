// 로그인 상태 유지 관련 유틸리티 함수들
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { isAuth } from "firebase-config";

const REMEMBER_ME_KEY = "rememberMe";

/**
 * 로그인 상태 유지 설정을 저장하고 Firebase Auth persistence를 설정합니다.
 */
export const setRememberMe = async (remember: boolean): Promise<void> => {
  try {
    // Firebase Auth persistence 설정
    if (remember) {
      await setPersistence(isAuth, browserLocalPersistence);
      localStorage.setItem(REMEMBER_ME_KEY, "true");
    } else {
      await setPersistence(isAuth, browserSessionPersistence);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    console.error("Persistence 설정 실패:", error);
    throw new Error("로그인 상태 유지 설정에 실패했습니다.");
  }
};

/**
 * 현재 persistence 설정을 가져옵니다.
 */
export const getCurrentPersistence = (): "local" | "session" | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(REMEMBER_ME_KEY) === "true" ? "local" : "session";
};

/**
 * 로그아웃 시 persistence 설정을 정리합니다.
 */
export const clearAuthPersistence = (): void => {
  localStorage.removeItem(REMEMBER_ME_KEY);
};
