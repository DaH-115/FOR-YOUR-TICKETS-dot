import { PUT } from "app/api/reviews/[id]/put.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { revalidatePath, revalidateTag } from "next/cache";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("next/cache");
jest.mock("firebase-admin-config", () => {
  const mockDoc = {
    get: jest.fn(),
    update: jest.fn(),
  };
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
  };
  return {
    adminFirestore: {
      collection: jest.fn(() => mockCollection),
    },
    mockDoc,
  };
});

const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;
const mockedRevalidatePath = revalidatePath as jest.Mock;
const mockedRevalidateTag = revalidateTag as jest.Mock;
const { mockDoc } = jest.requireMock("firebase-admin-config");

describe("PUT /api/reviews/[id]", () => {
  const mockUid = "test-user-id";
  const mockReviewId = "test-review-id";
  const mockUpdateData = {
    reviewTitle: "Updated Title",
    reviewContent: "Updated content.",
    rating: 4,
  };

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockDoc.get.mockClear();
    mockDoc.update.mockClear();
  });

  test("성공적으로 리뷰를 수정하고 200 상태 코드를 반환해야 합니다", async () => {
    // 정상적으로 인증, 소유권, Firestore update, 캐시 무효화까지 모두 성공하는 경우
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ user: { uid: mockUid } }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    const request = createMockRequest({ method: "PUT", body: mockUpdateData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("리뷰가 성공적으로 수정되었습니다.");
    expect(mockDoc.update).toHaveBeenCalledTimes(1);
    expect(mockDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        "review.reviewTitle": mockUpdateData.reviewTitle,
        "review.reviewContent": mockUpdateData.reviewContent,
        "review.rating": mockUpdateData.rating,
      }),
    );
    expect(mockedRevalidateTag).toHaveBeenCalledWith("reviews");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/ticket-list");
  });

  test("요청 본문에 필수 필드가 누락되면 400 에러를 반환해야 합니다", async () => {
    // reviewTitle, reviewContent, rating 중 하나라도 누락 시 400 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    const incompleteData = { reviewTitle: "Incomplete" };
    const request = createMockRequest({ method: "PUT", body: incompleteData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("reviewTitle, reviewContent, rating이 필요합니다.");
  });

  test("인증에 실패하면 401 에러를 반환해야 합니다", async () => {
    // 인증 실패 시 401 반환
    mockedVerifyAuthToken.mockResolvedValue({
      success: false,
      error: "인증 실패",
      statusCode: 401,
    });
    const request = createMockRequest({ method: "PUT", body: mockUpdateData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    expect(response.status).toBe(401);
  });

  test("리뷰를 찾을 수 없으면 404 에러를 반환해야 합니다", async () => {
    // 리뷰 문서가 존재하지 않을 때 404 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({ exists: false });
    const request = createMockRequest({ method: "PUT", body: mockUpdateData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
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
    const request = createMockRequest({ method: "PUT", body: mockUpdateData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    expect(response.status).toBe(403);
  });

  test("리뷰 수정 중 서버 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
    // Firestore update 중 에러 발생 시 500 반환
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ user: { uid: mockUid } }),
    });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
    mockDoc.update.mockRejectedValue(new Error("DB 업데이트 오류"));
    const request = createMockRequest({ method: "PUT", body: mockUpdateData });
    const response = await PUT(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    expect(response.status).toBe(500);
  });
});
