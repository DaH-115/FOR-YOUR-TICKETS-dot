import { POST } from "app/api/reviews/[id]/likes/post.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken } from "lib/auth/verifyToken";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => "ts"),
    increment: jest.fn((n: number) => ({ _increment: n })),
  },
}));

const mockLikeRef = { get: jest.fn() };
const mockReviewRef = {
  get: jest.fn(),
  collection: jest.fn(() => ({ doc: jest.fn(() => mockLikeRef) })),
};
const mockTx = {
  set: jest.fn(),
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

describe("POST /api/reviews/[id]/likes", () => {
  const reviewId = "rev-1";
  const mockedVerify = verifyAuthToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedVerify.mockResolvedValue({ success: true, uid: "user-1" });
    mockLikeRef.get.mockResolvedValue({ exists: false });
    mockReviewRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ likeCount: 1 }),
    });
  });

  test("계약: 인증·리뷰 존재·미좋아요 상태면 201과 isLiked·likeCount를 반환한다", async () => {
    mockReviewRef.get
      .mockResolvedValueOnce({ exists: true, data: () => ({ likeCount: 0 }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ likeCount: 1 }) });

    const req = createMockRequest({ method: "POST" });
    const res = await POST(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.isLiked).toBe(true);
    expect(body.likeCount).toBe(1);
    expect(mockTx.set).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
  });

  test("계약: 이미 좋아요면 409를 반환한다", async () => {
    mockLikeRef.get.mockResolvedValue({ exists: true });
    const req = createMockRequest({ method: "POST" });
    const res = await POST(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    expect(res.status).toBe(409);
  });

  test("계약: 리뷰가 없으면 404를 반환한다", async () => {
    mockReviewRef.get.mockResolvedValue({ exists: false });
    const req = createMockRequest({ method: "POST" });
    const res = await POST(req as NextRequest, {
      params: Promise.resolve({ id: reviewId }),
    });
    expect(res.status).toBe(404);
  });
});
