import { DELETE } from "app/api/reviews/[id]/delete.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";
import { revalidatePath, revalidateTag } from "next/cache";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("lib/users/updateUserActivityLevel");
jest.mock("next/cache");
jest.mock("firebase-admin-config", () => {
  const mockBatch = {
    delete: jest.fn(),
    commit: jest.fn(),
  };
  const mockCommentsCollection = { get: jest.fn() };
  const mockLikedByCollection = { get: jest.fn() };
  const mockDoc = {
    get: jest.fn(),
    collection: jest.fn((name) => {
      if (name === "comments") return mockCommentsCollection;
      if (name === "likedBy") return mockLikedByCollection;
      return mockCommentsCollection;
    }),
  };
  const mockCollection = { doc: jest.fn(() => mockDoc) };
  return {
    adminFirestore: {
      collection: jest.fn(() => mockCollection),
      batch: jest.fn(() => mockBatch),
    },
    mockBatch,
    mockDoc,
    mockCommentsCollection,
    mockLikedByCollection,
  };
});

const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;
const mockedUpdateUserActivityLevel = updateUserActivityLevel as jest.Mock;
const mockedRevalidatePath = revalidatePath as jest.Mock;
const mockedRevalidateTag = revalidateTag as jest.Mock;
const { mockBatch, mockDoc, mockCommentsCollection, mockLikedByCollection } =
  jest.requireMock("firebase-admin-config");

describe("DELETE /api/reviews/[id]", () => {
  const mockUid = "test-user-id";
  const mockReviewId = "test-review-id";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockBatch.delete.mockClear();
    mockBatch.commit.mockClear();
    mockDoc.get.mockClear();
    mockCommentsCollection.get.mockClear();
    mockLikedByCollection.get.mockClear();
  });

  test("성공적으로 리뷰를 삭제하고 200 상태 코드를 반환해야 합니다", async () => {
    // 정상적으로 인증, 소유권, Firestore 삭제, 등급 업데이트, 캐시 무효화까지 모두 성공하는 경우
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ user: { uid: mockUid } }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    mockCommentsCollection.get.mockResolvedValue({
      docs: [{ ref: { path: "comment1" } }, { ref: { path: "comment2" } }],
      forEach: jest.fn((callback) => {
        callback({ ref: { path: "comment1" } });
        callback({ ref: { path: "comment2" } });
      }),
    });
    mockLikedByCollection.get.mockResolvedValue({
      docs: [{ ref: { path: "like1" } }, { ref: { path: "like2" } }],
      forEach: jest.fn((callback) => {
        callback({ ref: { path: "like1" } });
        callback({ ref: { path: "like2" } });
      }),
    });
    mockBatch.commit.mockResolvedValue(undefined);
    mockedUpdateUserActivityLevel.mockResolvedValue("PRO");
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { id: mockReviewId },
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("리뷰가 성공적으로 삭제되었습니다.");
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    expect(mockBatch.delete).toHaveBeenCalledTimes(5);
    expect(mockedRevalidateTag).toHaveBeenCalledWith("reviews");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/ticket-list");
    expect(mockedUpdateUserActivityLevel).toHaveBeenCalledWith(mockUid, -1);
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
      params: { id: mockReviewId },
    });
    expect(response.status).toBe(401);
  });

  test("리뷰를 찾을 수 없으면 404 에러를 반환해야 합니다", async () => {
    // 리뷰 문서가 존재하지 않을 때 404 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({ exists: false });
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { id: mockReviewId },
    });
    expect(response.status).toBe(404);
  });

  test("리소스 소유자가 아니면 403 에러를 반환해야 합니다", async () => {
    // 인증된 사용자와 리뷰 작성자의 UID가 다를 때 403 반환
    const anotherUid = "another-user-id";
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: anotherUid });
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ user: { uid: mockUid } }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({
      success: false,
      statusCode: 403,
    });
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { id: mockReviewId },
    });
    expect(response.status).toBe(403);
  });

  test("리뷰 삭제 중 서버 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
    // Firestore 배치 커밋 중 에러 발생 시 500 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ user: { uid: mockUid } }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    mockCommentsCollection.get.mockResolvedValue({
      docs: [],
      forEach: jest.fn(),
    });
    mockLikedByCollection.get.mockResolvedValue({
      docs: [],
      forEach: jest.fn(),
    });
    mockBatch.commit.mockRejectedValue(new Error("배치 커밋 오류"));
    const request = createMockRequest({ method: "DELETE" });
    const response = await DELETE(request as NextRequest, {
      params: { id: mockReviewId },
    });
    expect(response.status).toBe(500);
  });
});
