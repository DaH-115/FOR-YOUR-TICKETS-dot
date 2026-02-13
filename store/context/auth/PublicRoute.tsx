"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "./useAuthState";

/**
 * 비로그인 상태에서만 접근 가능한 페이지용 가드 컴포넌트
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
