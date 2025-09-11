// S3 Presigned URL 비동기 로딩/캐싱/에러 관리 커스텀 훅
// - S3 이미지 등 리소스 접근 시 presigned URL을 안전하게 받아옴
// - 인증/공개 여부, 캐시, 에러 처리 등 모든 부수효과를 훅 내부에서 처리
// - UI 컴포넌트는 url, loading, error만 사용하면 됨
import { useEffect, useState, useRef } from "react";
import { isAuth } from "firebase-config";
import { useAuth } from "store/context/auth/authContext";
import { fetchPresignedUrl } from "app/utils/api/fetchPresignedUrl";

// 메모리 내 캐시 (key: S3 key, value: { url, expiresAt })
// - expiresAt: presigned URL 만료 시각(UNIX timestamp, ms)
const presignedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// 캐시 정리 관련 전역 변수
let cleanupTimer: NodeJS.Timeout | null = null;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5분마다 정리

/**
 * 만료된 캐시 항목들을 제거하는 정리 함수
 */
function cleanupExpiredCache() {
  const now = Date.now();
  const expiredKeys: string[] = [];

  // 만료된 항목들의 키를 수집
  for (const [key, value] of presignedUrlCache.entries()) {
    if (value.expiresAt <= now) {
      expiredKeys.push(key);
    }
  }

  // 만료된 항목들을 캐시에서 제거
  expiredKeys.forEach((key) => {
    presignedUrlCache.delete(key);
  });

  // 정리된 항목이 있으면 로그 출력 (개발 환경에서만)
  if (expiredKeys.length > 0 && process.env.NODE_ENV === "development") {
    console.log(`캐시 정리: ${expiredKeys.length}개 만료 항목 제거`);
  }
}

/**
 * 캐시 키 생성 헬퍼
 * - 공개 여부를 포함하여 동일 key라도 공개/비공개가 다르면 분리
 */
function buildCacheKey(key: string, isPublic: boolean) {
  return `${isPublic ? "public" : "private"}:${key}`;
}

/**
 * 주기적 캐시 정리 타이머를 시작하는 함수
 */
function startCleanupTimer() {
  if (cleanupTimer) {
    return; // 이미 타이머가 실행 중이면 중복 시작 방지
  }

  cleanupTimer = setInterval(cleanupExpiredCache, CLEANUP_INTERVAL);

  // 초기 정리 실행 (즉시 한 번 실행)
  cleanupExpiredCache();
}

/**
 * 캐시 정리 타이머를 정리하는 함수
 */
function stopCleanupTimer() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * 캐시에서 유효한 항목만 반환하는 헬퍼 함수
 */
function getValidCachedItem(cacheKey: string) {
  const cached = presignedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  // 만료된 항목이면 즉시 제거
  if (cached) {
    presignedUrlCache.delete(cacheKey);
  }

  return null;
}

interface UsePresignedUrlProps {
  key?: string | null; // S3에 저장된 파일의 경로
  fallbackUrl?: string; // 로딩 중이거나 에러 시 표시할 기본 URL
  isPublic?: boolean; // 공개 리소스 여부. true이면 인증 없이 요청
}

export function usePresignedUrl({
  key,
  fallbackUrl,
  isPublic = false,
}: UsePresignedUrlProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  // 상태를 useState로 관리
  const [url, setUrl] = useState<string>(fallbackUrl || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 캐시 정리 타이머 시작
  useEffect(() => {
    startCleanupTimer();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      // 다른 컴포넌트에서도 이 훅을 사용할 수 있으므로
      // 모든 인스턴스가 언마운트되었는지 확인 후 타이머 정리
      // (실제로는 React의 cleanup이 자동으로 처리되므로 여기서는 타이머를 계속 유지)
    };
  }, []);

  /**
   * key, 인증상태 등이 바뀔 때마다 presigned URL을 비동기 로딩
   * - 인증 필요/불필요, 캐시, 에러 등 모든 분기 처리
   */
  useEffect(() => {
    // 인증 상태 로딩 대기
    if (!isPublic && isAuthLoading) {
      setLoading(true);
      return;
    }
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      setUrl(fallbackUrl || "");
      setLoading(false);
      setError(null);
      return;
    }
    if (!isPublic && !isAuthenticated) {
      setUrl(fallbackUrl || "");
      setLoading(false);
      setError("인증이 필요합니다.");
      return;
    }

    // presigned URL 캐시 조회 및 만료 체크 (개선된 방식)
    const cacheKey = buildCacheKey(key, isPublic);
    const cached = getValidCachedItem(cacheKey);
    if (cached) {
      setUrl(cached.url);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const idToken =
          !isPublic && isAuth.currentUser
            ? await isAuth.currentUser.getIdToken()
            : null;
        if (!isPublic && !idToken) {
          throw new Error("인증 토큰을 가져올 수 없습니다.");
        }
        // fetchPresignedUrl에서 { url, expiresIn } 반환
        // expiresAt: 현재 시각 + expiresIn(초) * 1000
        const { url, expiresIn } = await fetchPresignedUrl({
          key,
          isPublic,
          idToken,
          signal: abortController.signal,
        });
        if (!abortController.signal.aborted) {
          // presigned URL과 만료 시각을 캐시에 저장
          presignedUrlCache.set(cacheKey, {
            url,
            expiresAt: Date.now() + expiresIn * 1000,
          });
          setUrl(url);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          let errorMsg =
            err instanceof Error
              ? err.message
              : "알 수 없는 에러가 발생했습니다.";
          // 인증 관련 에러 메시지 변환
          if (errorMsg.includes("인증")) {
            errorMsg = "로그인이 필요합니다.";
          }
          setUrl(fallbackUrl || "");
          setLoading(false);
          setError(errorMsg);
        }
      }
    })();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [key, fallbackUrl, isAuthenticated, isAuthLoading, isPublic]);

  // UI에서 사용할 상태 반환
  return { url, loading, error };
}

// 앱 종료 시 타이머 정리 (선택적)
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", stopCleanupTimer);
}
