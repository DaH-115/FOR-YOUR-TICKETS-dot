import { getAuthHeaders } from "@/utils/getIdToken/getAuthHeaders";

/**
 * 토큰 만료 시 자동으로 새로고침하여 API 요청을 재시도합니다.
 *
 * @param apiCall - API 호출 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 1)
 * @returns API 응답
 */
export async function apiCallWithTokenRefresh<T>(
  apiCall: (headers: Record<string, string>) => Promise<T>,
  maxRetries: number = 1,
): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const headers = await getAuthHeaders(attempt > 0); // 재시도 시 토큰 새로고침
      return await apiCall(headers);
    } catch (error) {
      // 토큰 만료 에러인 경우 재시도
      if (attempt < maxRetries) {
        let message;
        let status;
        if (typeof error === "object" && error !== null) {
          if ("message" in error)
            message = (error as { message: string }).message;
          if ("status" in error) status = (error as { status: number }).status;
        }
        if (
          (message &&
            (message.includes("토큰이 만료") ||
              message.includes("token expired"))) ||
          status === 401
        ) {
          // 토큰 만료로 인한 재시도
          attempt++;
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error("최대 재시도 횟수를 초과했습니다.");
}
