export const MAX_REVIEW_PHOTO_COUNT = 4;
export const REVIEW_PHOTO_KEY_PREFIX = "review-img";

interface ReviewPhotoValidationResult {
  success: boolean;
  photoKeys?: string[];
  error?: string;
}

export function validateReviewPhotoKeys(
  photoKeys: unknown,
  uid: string,
): ReviewPhotoValidationResult {
  if (photoKeys === undefined) {
    return { success: true };
  }

  if (!Array.isArray(photoKeys)) {
    return { success: false, error: "photoKeys는 배열이어야 합니다." };
  }

  if (photoKeys.length > MAX_REVIEW_PHOTO_COUNT) {
    return {
      success: false,
      error: `리뷰 사진은 최대 ${MAX_REVIEW_PHOTO_COUNT}장까지 등록할 수 있습니다.`,
    };
  }

  const expectedPrefix = `${REVIEW_PHOTO_KEY_PREFIX}/${uid}/`;
  const uniqueKeys = new Set<string>();

  for (const photoKey of photoKeys) {
    if (typeof photoKey !== "string" || !photoKey.trim()) {
      return { success: false, error: "photoKeys는 문자열 배열이어야 합니다." };
    }

    if (!photoKey.startsWith(expectedPrefix) || photoKey.includes("..")) {
      return { success: false, error: "잘못된 리뷰 사진 경로입니다." };
    }

    if (uniqueKeys.has(photoKey)) {
      return { success: false, error: "중복된 리뷰 사진이 포함되어 있습니다." };
    }

    uniqueKeys.add(photoKey);
  }

  return { success: true, photoKeys };
}
