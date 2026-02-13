"use client";

import { useAppSelector } from "store/redux-toolkit/hooks";
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from "store/redux-toolkit/slice/userSlice";

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
