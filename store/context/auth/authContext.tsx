"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { isAuth } from "firebase-config";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import {
  setAuthState,
  fetchUserProfile,
  selectIsAuthenticated,
  selectAuthLoading,
} from "store/redux-toolkit/slice/userSlice";

/**
 * Firebase Auth 상태를 Redux와 동기화하는 Provider
 * - onAuthStateChanged 리스너 설정
 * - 로그인 시 프로필 자동 로드
 */
export function AuthProvider({ children }: { children: ReactNode }) {
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

/**
 * Redux 기반 인증 상태 훅
 * - 컴포넌트에서 인증 상태를 쉽게 확인
 */
export function useAuthState() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);

  return {
    isAuthenticated,
    isLoading: authLoading,
  };
}

/**
 * 로딩 스피너 컴포넌트
 * - 인증 확인 중 표시
 */
function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-accent-500" />
    </div>
  );
}

/**
 * 인증이 필요한 페이지용 컴포넌트
 * - 로그인 필수 페이지에서 사용
 * - 미인증 시 로그인 페이지로 리다이렉트
 */
export function PrivateRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthState();

  useEffect(() => {
    // 로딩이 끝나고 인증되지 않은 경우 리다이렉트
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <AuthLoading />;
  }

  // 인증되지 않았으면 null 반환 (리다이렉트 진행 중)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * 비로그인 상태에서만 접근 가능한 페이지용 컴포넌트
 * - 로그인/회원가입 페이지에서 사용
 * - 이미 로그인된 경우 홈으로 리다이렉트
 */
export function PublicRoute({
  children,
  redirectTo = "/",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthState();

  useEffect(() => {
    // 로딩이 끝나고 인증된 경우 리다이렉트
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  // 로딩 중이면 아무것도 표시하지 않음
  if (isLoading) {
    return null;
  }

  // 인증된 상태면 null 반환 (리다이렉트 진행 중)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
