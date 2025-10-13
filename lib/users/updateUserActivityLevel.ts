import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "firebase-admin-config";
import { getActivityLevel } from "lib/utils/getActivityLevel";

/**
 * 사용자의 활동 등급과 리뷰 개수를 업데이트합니다.
 *
 * @param uid 사용자 UID
 * @param incrementValue 증감값 (+1: 리뷰 작성, -1: 리뷰 삭제)
 * @returns 업데이트된 활동 등급 라벨
 */
export async function updateUserActivityLevel(
  uid: string,
  incrementValue: number = 0,
): Promise<string | null> {
  if (!uid) {
    throw new Error("uid가 필요합니다.");
  }

  try {
    const userRef = adminFirestore.collection("users").doc(uid);

    // 1. reviewCount 증감 (리뷰 작성: +1, 리뷰 삭제: -1)
    if (incrementValue !== 0) {
      await userRef.update({
        reviewCount: FieldValue.increment(incrementValue),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 2. 업데이트된 문서 읽기
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const reviewCount = userData?.reviewCount ?? 0;

    // 3. 리뷰 개수에 따른 활동 등급 계산
    const activityLevel = getActivityLevel(reviewCount);

    // 4. 등급이 변경된 경우에만 업데이트
    if (userData?.activityLevel !== activityLevel.label) {
      await userRef.update({
        activityLevel: activityLevel.label,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return activityLevel.label;
  } catch (error) {
    console.error(`사용자(uid:${uid}) 등급 업데이트 실패:`, error);
    // 등급 업데이트 실패 시 null을 반환하여, 호출 측에서 에러를 전파하지 않도록 함
    return null;
  }
}
