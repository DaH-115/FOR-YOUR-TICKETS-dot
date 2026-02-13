"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "./useAuthState";

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
 * 인증이 필요한 페이지용 가드 컴포넌트
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
