import { getIdToken } from "@/utils/getIdToken/getIdToken";

/**
 * API 요청용 Authorization 헤더를 생성합니다.
 * - 토큰이 없으면 빈 객체를 반환하여 불필요한 401 응답을 방지합니다.
 *
 * @param forceRefresh - 토큰을 강제로 새로고침할지 여부 (기본값: false)
 * @returns Authorization 헤더 객체 또는 빈 객체
 */
export async function getAuthHeaders(
  forceRefresh: boolean = false,
): Promise<Record<string, string>> {
  const idToken = await getIdToken(forceRefresh);
  if (!idToken) {
    return {};
  }
  return {
    Authorization: `Bearer ${idToken}`,
  };
}
