import { isAuth } from "firebase-config";
import { onAuthStateChanged } from "firebase/auth";

/** Firebase Auth 초기화 완료 여부 */
let authReady = false;
/** 초기화 완료를 기다리는 Promise (한 번만 생성) */
let authReadyPromise: Promise<void> | null = null;

/**
 * Firebase Auth 상태가 최초로 확정될 때까지 대기합니다.
 * - 이미 확정된 경우 즉시 resolve
 * - onAuthStateChanged 첫 콜백이 곧 "초기화 완료" 신호
 */
export function waitForAuthReady(): Promise<void> {
  if (authReady) return Promise.resolve();

  if (!authReadyPromise) {
    authReadyPromise = new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(isAuth, () => {
        authReady = true;
        unsubscribe();
        resolve();
      });
    });
  }

  return authReadyPromise;
}

/**
 * 현재 로그인된 사용자의 Firebase ID Token을 가져옵니다.
 * - Firebase Auth 초기화가 완료될 때까지 대기한 후 토큰을 조회합니다.
 *
 * @param forceRefresh - 토큰을 강제로 새로고침할지 여부 (기본값: false)
 * @returns Firebase ID Token 또는 null
 */
export async function getIdToken(
  forceRefresh: boolean = false,
): Promise<string | null> {
  try {
    // Firebase Auth 초기화가 완료될 때까지 대기
    await waitForAuthReady();

    const currentUser = isAuth.currentUser;
    if (!currentUser) {
      return null;
    }
    // Firebase ID Token 가져오기
    const idToken = await currentUser.getIdToken(forceRefresh);
    return idToken;
  } catch (error) {
    console.error("ID Token 가져오기 실패:", error);
    return null;
  }
}
