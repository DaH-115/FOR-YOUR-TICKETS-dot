import {
  MAX_REVIEW_PHOTO_COUNT,
  validateReviewPhotoKeys,
} from "app/api/reviews/review-photo-validation";

describe("validateReviewPhotoKeys", () => {
  const uid = "user-123";

  test("photoKeys가 없으면 허용한다", () => {
    expect(validateReviewPhotoKeys(undefined, uid)).toEqual({ success: true });
  });

  test("review-img 사용자 경로의 사진 key를 허용한다", () => {
    const photoKeys = [
      `review-img/${uid}/1000_photo-1.jpg`,
      `review-img/${uid}/1001_photo-2.jpg`,
    ];

    expect(validateReviewPhotoKeys(photoKeys, uid)).toEqual({
      success: true,
      photoKeys,
    });
  });

  test("최대 등록 개수를 초과하면 거부한다", () => {
    const photoKeys = Array.from(
      { length: MAX_REVIEW_PHOTO_COUNT + 1 },
      (_, index) => `review-img/${uid}/${index}_photo.jpg`,
    );

    expect(validateReviewPhotoKeys(photoKeys, uid)).toMatchObject({
      success: false,
    });
  });

  test("다른 사용자의 review-img 경로는 거부한다", () => {
    expect(
      validateReviewPhotoKeys(["review-img/other-user/1000_photo.jpg"], uid),
    ).toMatchObject({ success: false });
  });

  test("profile-img 경로는 리뷰 사진으로 거부한다", () => {
    expect(
      validateReviewPhotoKeys([`profile-img/${uid}/1000_photo.jpg`], uid),
    ).toMatchObject({ success: false });
  });

  test("중복 key는 거부한다", () => {
    const photoKey = `review-img/${uid}/1000_photo.jpg`;

    expect(validateReviewPhotoKeys([photoKey, photoKey], uid)).toMatchObject({
      success: false,
    });
  });
});
