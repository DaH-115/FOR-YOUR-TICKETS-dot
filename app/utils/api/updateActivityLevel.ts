import { getAuthHeaders } from "@/utils/getIdToken/getAuthHeaders";

interface UpdateActivityLevelResponse {
  message: string;
  activityLevel: string;
  user: {
    uid: string;
    [key: string]: unknown;
  };
}

/**
 * 사용자 활동 등급을 업데이트합니다.
 * @param uid - 사용자 ID
 * @param activityLevel - 새로운 활동 등급 (NEWBIE, REGULAR, ACTIVE, EXPERT)
 * @returns 업데이트된 사용자 정보
 */
export async function updateActivityLevel(
  uid: string,
  activityLevel: string,
): Promise<UpdateActivityLevelResponse> {
  if (!uid || !activityLevel) {
    throw new Error("사용자 ID와 활동 등급이 필요합니다.");
  }

  try {
    // 인증 헤더 생성
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`/api/users/${uid}/activity-level`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        activityLevel,
      }),
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
