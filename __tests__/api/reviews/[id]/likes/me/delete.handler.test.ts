import { DELETE } from "app/api/reviews/[id]/likes/me/delete.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken } from "lib/auth/verifyToken";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment: jest.fn((n: number) => ({ _increment: n })),
  },
}));

const mockLikeRef = { get: jest.fn() };
const mockReviewRef = {
  get: jest.fn(),
  collection: jest.fn(() => ({ doc: jest.fn(() => mockLikeRef) })),
};
const mockTx = {
  delete: jest.fn(),
  update: jest.fn(),
};
jest.mock("firebase-admin-config", () => ({
  adminFirestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => mockReviewRef),
    })),
    runTransaction: jest.fn(async (fn: (tx: typeof mockTx) => Promise<void>) => {
      await fn(mockTx);
    }),
  },
}));

describe("DELETE /api/reviews/[id]/likes/me", () => {
  const reviewId = "rev-1";
  const mockedVerify = verifyAuthToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedVerify.mockResolvedValue({ success: true, uid: "user-1" });
    mockLikeRef.get.mockResolvedValue({ exists: true });
    mockReviewRef.get
      .mockResolvedValueOnce({ exists: true, data: () => ({ likeCount: 2 }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ likeCount: 1 }) });
  });

  test("계약: 좋아요한 상태면 200과 isLiked false·likeCount를 반환한다", async () => {
    const req = createMockRequest({ method: "DELETE" });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.isLiked).toBe(false);
    expect(body.likeCount).toBe(1);
    expect(mockTx.delete).toHaveBeenCalled();
  });

  test("계약: 좋아요하지 않았으면 409를 반환한다", async () => {
    mockLikeRef.get.mockResolvedValue({ exists: false });
    const req = createMockRequest({ method: "DELETE" });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    expect(res.status).toBe(409);
  });

  test("계약: 리뷰가 없으면 404를 반환한다", async () => {
    mockReviewRef.get.mockReset();
    mockReviewRef.get.mockResolvedValue({ exists: false });
    const req = createMockRequest({ method: "DELETE" });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    expect(res.status).toBe(404);
  });
});
