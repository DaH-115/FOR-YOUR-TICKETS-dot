import { PUT } from "app/api/reviews/[id]/comments/[commentId]/put.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => "mock-timestamp"),
  },
}));

const mockCommentDoc = { get: jest.fn(), update: jest.fn() };
const mockSubCollection = { doc: jest.fn(() => mockCommentDoc) };
const mockMainDoc = { collection: jest.fn(() => mockSubCollection) };
jest.mock("firebase-admin-config", () => ({
  adminFirestore: {
    collection: jest.fn(() => ({ doc: jest.fn(() => mockMainDoc) })),
  },
}));

const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;

const paramsFor = (reviewId: string, commentId: string) =>
  Promise.resolve({ id: reviewId, commentId });

describe("PUT /api/reviews/[id]/comments/[commentId]", () => {
  const mockReviewId = "test-review-id";
  const mockCommentId = "test-comment-id";
  const mockUid = "test-user-id";
  const mockContent = "Updated comment content.";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
  });

  test("성공적으로 댓글을 수정하고 200 상태 코드를 반환해야 합니다", async () => {
    // 정상적으로 인증, 소유권, Firestore update까지 모두 성공하는 경우
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockCommentDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ authorId: mockUid }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    const request = createMockRequest({
      method: "PUT",
      body: { content: mockContent },
    });
    const response = await PUT(request as NextRequest, {
      params: paramsFor(mockReviewId, mockCommentId),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockCommentDoc.update).toHaveBeenCalledWith({
      content: mockContent,
      updatedAt: "mock-timestamp",
    });
  });

  test("content가 없으면 400 에러를 반환해야 합니다", async () => {
    // content가 없거나 공백일 때 400 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    const request = createMockRequest({
      method: "PUT",
      body: { content: "  " },
    });
    const response = await PUT(request as NextRequest, {
      params: paramsFor(mockReviewId, mockCommentId),
    });
    expect(response.status).toBe(400);
  });

  test("댓글을 찾을 수 없으면 404 에러를 반환해야 합니다", async () => {
    // 댓글 문서가 존재하지 않을 때 404 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockCommentDoc.get.mockResolvedValue({ exists: false });
    const request = createMockRequest({
      method: "PUT",
      body: { content: mockContent },
    });
    const response = await PUT(request as NextRequest, {
      params: paramsFor(mockReviewId, mockCommentId),
    });
    expect(response.status).toBe(404);
  });

  test("리소스 소유자가 아니면 403 에러를 반환해야 합니다", async () => {
    // 인증된 사용자와 댓글 작성자의 UID가 다를 때 403 반환
    mockedVerifyAuthToken.mockResolvedValue({
      success: true,
      uid: "another-uid",
    });
    mockCommentDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ authorId: mockUid }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({
      success: false,
      statusCode: 403,
    });
    const request = createMockRequest({
      method: "PUT",
      body: { content: mockContent },
    });
    const response = await PUT(request as NextRequest, {
      params: paramsFor(mockReviewId, mockCommentId),
    });
    expect(response.status).toBe(403);
  });

  test("DB 수정 중 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
    // Firestore update 중 에러 발생 시 500 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockCommentDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ authorId: mockUid }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    mockCommentDoc.update.mockRejectedValue(new Error("DB Error"));
    const request = createMockRequest({
      method: "PUT",
      body: { content: mockContent },
    });
    const response = await PUT(request as NextRequest, {
      params: paramsFor(mockReviewId, mockCommentId),
    });
    expect(response.status).toBe(500);
  });
});
