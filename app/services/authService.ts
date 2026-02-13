/**
 * 인증/사용자 관련 클라이언트 API 호출
 */

import { getAuthHeaders } from "@/utils/getIdToken/getAuthHeaders";

/**
 * 닉네임/이메일 중복 체크 API 호출
 */
export async function checkDuplicate(
  type: "displayName" | "email",
  value: string,
): Promise<{ available: boolean; message: string }> {
  const response = await fetch("/api/auth/check-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, value }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "중복 확인에 실패했습니다.");
  }
  return result;
}

interface UpdateActivityLevelResponse {
  message: string;
  activityLevel: string;
  user: {
    uid: string;
    [key: string]: unknown;
  };
}

/**
 * 사용자 활동 등급 업데이트 API 호출
 * @param uid - 사용자 ID
 * @param activityLevel - 새로운 활동 등급 (NEWBIE, REGULAR, ACTIVE, EXPERT)
 */
export async function updateActivityLevel(
  uid: string,
  activityLevel: string,
): Promise<UpdateActivityLevelResponse> {
  if (!uid || !activityLevel) {
    throw new Error("사용자 ID와 활동 등급이 필요합니다.");
  }

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`/api/users/${uid}/activity-level`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ activityLevel }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "등급 업데이트에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("등급 업데이트 API 호출 실패:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
}
