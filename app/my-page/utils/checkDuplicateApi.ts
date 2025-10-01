// 중복 체크 API 호출 및 에러 가공만 담당하는 서비스 유틸
import { checkDuplicate } from "app/utils/api/checkDuplicate";
import { firebaseErrorHandler } from "app/utils/firebaseError";
import type { DuplicateType } from "app/my-page/hooks/useDuplicateCheckState";

/**
 * 실제 API 호출 및 에러 메시지 가공만 담당 (테스트 시 checkDuplicateFn 주입 가능)
 */
export async function checkDuplicateApi(
  type: DuplicateType,
  value: string,
  checkDuplicateFn: typeof checkDuplicate = checkDuplicate,
): Promise<{ available: boolean; message: string; error: unknown | null }> {
  try {
    const result = await checkDuplicateFn(type, value);
    return {
      available: result.available,
      message: result.message,
      error: null,
    };
  } catch (err) {
    const { message } = firebaseErrorHandler(err);
    return { available: false, message, error: err };
  }
}
