"use client";

import { useEffect, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { isAuth } from "firebase-config";
import { useAppDispatch } from "store/redux-toolkit/hooks";
import {
  setAuthState,
  fetchUserProfile,
} from "store/redux-toolkit/slice/userSlice";

/**
 * Firebase Auth 상태를 Redux와 동기화하는 초기화 컴포넌트
 * - onAuthStateChanged 리스너 설정
 * - 로그인 시 프로필 자동 로드
 * - Context를 생성하지 않으며, 순수하게 동기화 역할만 수행
 */
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Firebase Auth 상태 변경 감지
    const unsubscribe = onAuthStateChanged(isAuth, (user) => {
      // Redux에 인증 상태 업데이트
      dispatch(setAuthState(user));

      // 로그인된 경우 프로필 정보 가져오기
      if (user) {
        dispatch(fetchUserProfile(user.uid));
      }
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
}
