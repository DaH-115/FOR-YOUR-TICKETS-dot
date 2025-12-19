import { DELETE } from "app/api/comments/[reviewId]/[commentId]/delete.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";
import { revalidatePath } from "next/cache";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("lib/users/updateUserActivityLevel");
jest.mock("next/cache");
jest.mock("firebase-admin-config", () => {
  const mockTransaction = {
    get: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };
  const mockCommentDoc = { get: jest.fn() };
  const mockCommentCollection = { doc: jest.fn(() => mockCommentDoc) };
  const mockReviewDoc = { collection: jest.fn(() => mockCommentCollection) };
  const mockReviewCollection = { doc: jest.fn(() => mockReviewDoc) };
  return {
    adminFirestore: {
      collection: jest.fn(() => mockReviewCollection),
      runTransaction: jest.fn().mockImplementation(async (callback) => {
        await callback(mockTransaction);
        return true;
      }),
    },
    mockTransaction,
    mockCommentDoc,
  };
});

const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;
const mockedUpdateUserActivityLevel = updateUserActivityLevel as jest.Mock;
const mockedRevalidatePath = revalidatePath as jest.Mock;
const { mockTransaction, mockCommentDoc } = jest.requireMock(
  "firebase-admin-config",
);

describe("DELETE /api/comments/[reviewId]/[commentId]", () => {
  const mockUid = "test-user-id";
  const mockReviewId = "test-review-id";
  const mockCommentId = "test-comment-id";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockTransaction.get.mockClear();
    mockTransaction.delete.mockClear();
    mockTransaction.update.mockClear();
    mockCommentDoc.get.mockClear();
  });

  test("성공적으로 댓글을 삭제하고 200 상태 코드를 반환해야 합니다", async () => {
    // 정상적으로 인증, 소유권, Firestore 트랜잭션, 등급 업데이트, 캐시 무효화까지 모두 성공하는 경우
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ authorId: mockUid }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    mockedUpdateUserActivityLevel.mockResolvedValue("PRO");
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { reviewId: mockReviewId, commentId: mockCommentId },
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("댓글이 성공적으로 삭제되었습니다.");
    expect(mockTransaction.get).toHaveBeenCalledTimes(1);
    expect(mockTransaction.delete).toHaveBeenCalledTimes(1);
    expect(mockTransaction.update).toHaveBeenCalledTimes(1);
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/ticket-list");
    expect(mockedUpdateUserActivityLevel).toHaveBeenCalledWith(mockUid);
  });

  test("인증에 실패하면 401 에러를 반환해야 합니다", async () => {
    // 인증 실패 시 401 반환
    mockedVerifyAuthToken.mockResolvedValue({
      success: false,
      error: "인증 실패",
      statusCode: 401,
    });
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { reviewId: mockReviewId, commentId: mockCommentId },
    });
    expect(response.status).toBe(401);
  });

  test("댓글을 찾을 수 없으면 404 에러를 반환해야 합니다", async () => {
    // 댓글 문서가 존재하지 않을 때 404 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockTransaction.get.mockResolvedValue({ exists: false });
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { reviewId: mockReviewId, commentId: mockCommentId },
    });
    expect(response.status).toBe(404);
  });

  test("리소스 소유자가 아니면 403 에러를 반환해야 합니다", async () => {
    // 인증된 사용자와 댓글 작성자의 UID가 다를 때 403 반환
    const anotherUid = "another-user-id";
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: anotherUid });
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ authorId: mockUid }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({
      success: false,
      statusCode: 403,
    });
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { reviewId: mockReviewId, commentId: mockCommentId },
    });
    expect(response.status).toBe(403);
  });
});
