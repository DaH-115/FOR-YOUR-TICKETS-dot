import { applyDerivedGlobalOrderNumbers } from "lib/reviews/applyDerivedGlobalOrderNumbers";
import type { ReviewDoc } from "types/review";

function minimalReview(overrides: Partial<ReviewDoc> = {}): ReviewDoc {
  return {
    id: "r1",
    user: {
      uid: "u1",
      displayName: "U",
      photoKey: null,
    },
    review: {
      movieId: 1,
      movieTitle: "M",
      originalTitle: "M",
      releaseYear: "2024",
      rating: 5,
      reviewTitle: "T",
      reviewContent: "C",
      createdAt: "",
      updatedAt: "",
      likeCount: 0,
    },
    ...overrides,
  };
}

describe("applyDerivedGlobalOrderNumbers", () => {
  test("빈 배열이면 빈 배열을 반환한다", () => {
    expect(applyDerivedGlobalOrderNumbers([], 100, 1, 10)).toEqual([]);
  });

  test("1페이지·총 3건이면 최신순 인덱스에 맞게 3,2,1을 부여한다", () => {
    const input = [
      minimalReview({ id: "a" }),
      minimalReview({ id: "b" }),
      minimalReview({ id: "c" }),
    ];
    const out = applyDerivedGlobalOrderNumbers(input, 3, 1, 10);
    expect(out.map((r) => r.orderNumber)).toEqual([3, 2, 1]);
  });

  test("이미 orderNumber가 있으면 덮어쓰지 않는다", () => {
    const input = [minimalReview({ orderNumber: 99 })];
    const out = applyDerivedGlobalOrderNumbers(input, 10, 1, 10);
    expect(out[0].orderNumber).toBe(99);
  });

  test("2페이지·pageSize 2·총 5건이면 첫 행은 3부터 시작한다", () => {
    const input = [
      minimalReview({ id: "p2-1" }),
      minimalReview({ id: "p2-2" }),
    ];
    const out = applyDerivedGlobalOrderNumbers(input, 5, 2, 2);
    expect(out.map((r) => r.orderNumber)).toEqual([3, 2]);
  });
});
