// S3 Presigned URL 비동기 로딩/캐싱/에러 관리 커스텀 훅
// - S3 이미지 등 리소스 접근 시 presigned URL을 안전하게 받아옴
// - 인증/공개 여부, 캐시, 에러 처리 등 모든 부수효과를 훅 내부에서 처리
// - UI 컴포넌트는 url, loading, error만 사용하면 됨
import { useEffect, useState, useRef } from "react";
import { fetchPresignedUrl } from "@/utils/api/fetchPresignedUrl";

// 메모리 내 캐시 (key: S3 key, value: { url, expiresAt })
// - expiresAt: presigned URL 만료 시각(UNIX timestamp, ms)
const presignedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * 캐시 키 생성 헬퍼
 * - 모든 프로필 이미지는 공개로 처리
 */
function buildCacheKey(key: string) {
  return `public:${key}`;
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
}

export function usePresignedUrl({ key, fallbackUrl }: UsePresignedUrlProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [url, setUrl] = useState(fallbackUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * key, 인증상태 등이 바뀔 때마다 presigned URL을 비동기 로딩
   * - 인증 필요/불필요, 캐시, 에러 등 모든 분기 처리
   */
  useEffect(() => {
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      setUrl(fallbackUrl || "");
      setLoading(false);
      setError(null);
      return;
    }

    // presigned URL 캐시 조회 및 만료 체크
    const cacheKey = buildCacheKey(key);
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
        const { url, expiresIn } = await fetchPresignedUrl({
          key,
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
          const errorMsg =
            err instanceof Error
              ? err.message
              : "알 수 없는 에러가 발생했습니다.";
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
  }, [key, fallbackUrl]);

  // UI에서 사용할 상태 반환
  return { url, loading, error };
}
