"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { isAuth } from "firebase-config";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import {
  setAuthState,
  fetchUserProfile,
  selectIsAuthenticated,
  selectAuthLoading,
} from "store/redux-toolkit/slice/userSlice";

interface AuthContextType {
  initializeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const initializeAuth = useCallback(() => {
    // Firebase Auth 상태 변경 감지
    // Firebase Auth가 자동으로 persistence를 관리하므로 별도 처리 불필요
    const unsubscribe = onAuthStateChanged(isAuth, (user) => {
      // Redux에서 인증 상태 관리
      dispatch(setAuthState(user));

      // 로그인된 경우 프로필 정보 가져오기
      if (user) {
        dispatch(fetchUserProfile(user.uid));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{ initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Redux 기반 인증 상태 훅
export function useAuthState() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);

  return {
    isAuthenticated,
    isLoading: authLoading,
  };
}

// 인증이 필요한 페이지용 컴포넌트 - Redux 기반
export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthState();

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div>인증 확인 중...</div>;
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return <>{children}</>;
}

// 비로그인 상태에서만 접근 가능한 페이지용 컴포넌트 - Redux 기반
export function PublicRoute({
  children,
  redirectTo = "/",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuthState();

  // 로딩 중이면 아무것도 표시하지 않음
  if (isLoading) {
    return null;
  }

  // 인증된 상태면 리다이렉트
  if (isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
    return null;
  }

  return <>{children}</>;
}
