import { GET, POST } from "@/api/reviews/route";
import { NextRequest } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";
import { revalidatePath, revalidateTag } from "next/cache";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/reviews/fetchReviewsPaginated");
jest.mock("lib/auth/verifyToken");
jest.mock("lib/users/updateUserActivityLevel");
jest.mock("next/cache");
jest.mock("firebase-admin-config", () => ({
  adminFirestore: {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
  },
}));

// 모킹된 함수 타입 명확화
const mockedFetchReviewsPaginated = fetchReviewsPaginated as jest.Mock;
const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;
const mockedUpdateUserActivityLevel = updateUserActivityLevel as jest.Mock;
const mockedRevalidatePath = revalidatePath as jest.Mock;
const mockedRevalidateTag = revalidateTag as jest.Mock;
const mockedFirestoreAdd = adminFirestore.collection("movie-reviews")
  .add as jest.Mock;

describe("리뷰 API 라우트 (/api/reviews)", () => {
  afterEach(() => {
    // 각 테스트 후 mock 호출 기록 초기화
    jest.clearAllMocks();
  });

  describe("POST /api/reviews", () => {
    const mockUid = "test-uid";
    const mockReviewData = {
      user: {
        uid: mockUid,
        displayName: "testUser",
        photoURL: "http://example.com/avatar.png",
      },
      review: {
        movieId: 123,
        movieTitle: "Test Movie",
        content: "Great movie!",
        rating: 5,
      },
    };

    test("성공적으로 리뷰를 생성하고 201 상태 코드를 반환해야 합니다", async () => {
      // 정상적인 인증, 소유권, Firestore 저장, 등급 업데이트, 캐시 무효화까지 모두 성공하는 경우
      mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
      mockedVerifyResourceOwnership.mockReturnValue({ success: true });
      mockedFirestoreAdd.mockResolvedValue({ id: "new-review-id" });
      mockedUpdateUserActivityLevel.mockResolvedValue("새싹");
      const request = createMockRequest({
        method: "POST",
        body: mockReviewData,
      });
      const response = await POST(request);
      const body = await response.json();
      expect(response.status).toBe(201);
      expect(body).toEqual({
        success: true,
        id: "new-review-id",
        message: "리뷰가 성공적으로 생성되었습니다.",
      });
      // Firestore에 리뷰가 올바르게 추가되었는지 확인
      expect(mockedFirestoreAdd).toHaveBeenCalledTimes(1);
      expect(mockedFirestoreAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockReviewData.user,
          review: expect.objectContaining({
            ...mockReviewData.review,
            likeCount: 0,
          }),
        }),
      );
      // 등급 업데이트, 캐시 무효화 함수 호출 확인
      await new Promise(process.nextTick);
      expect(mockedUpdateUserActivityLevel).toHaveBeenCalledWith(mockUid, 1);
      expect(mockedRevalidatePath).toHaveBeenCalledWith("/ticket-list");
      expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
      expect(mockedRevalidateTag).toHaveBeenCalledWith("reviews");
    });

    test("인증 토큰이 유효하지 않으면 401 에러를 반환해야 합니다", async () => {
      // 인증 실패 시 401 반환
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "Invalid token",
        statusCode: 401,
      });
      const request = createMockRequest({
        method: "POST",
        body: mockReviewData,
      });
      const response = await POST(request);
      const body = await response.json();
      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Invalid token" });
    });

    test("필수 필드(user 또는 review)가 누락되면 400 에러를 반환해야 합니다", async () => {
      // review 데이터가 누락된 경우 400 반환
      mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
      const request = createMockRequest({
        method: "POST",
        body: { user: mockReviewData.user },
      });
      const response = await POST(request);
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toEqual({ error: "user와 review 데이터가 필요합니다." });
    });

    test("리소스 소유자가 아니면 403 에러를 반환해야 합니다", async () => {
      // 인증된 사용자와 리뷰 작성자의 UID가 다를 때 403 반환
      mockedVerifyAuthToken.mockResolvedValue({
        success: true,
        uid: "another-uid",
      });
      mockedVerifyResourceOwnership.mockReturnValue({
        success: false,
        error: "Forbidden",
        statusCode: 403,
      });
      const request = createMockRequest({
        method: "POST",
        body: mockReviewData,
      });
      const response = await POST(request);
      const body = await response.json();
      expect(response.status).toBe(403);
      expect(body).toEqual({ error: "Forbidden" });
      expect(mockedVerifyResourceOwnership).toHaveBeenCalledWith(
        "another-uid",
        mockReviewData.user.uid,
      );
    });

    test("리뷰 생성 중 서버 오류가 발생하면 500 에러를 반환해야 합니다", async () => {
      // Firestore 저장 중 에러 발생 시 500 반환
      mockedVerifyAuthToken.mockResolvedValue({ success: true, uid: mockUid });
      mockedVerifyResourceOwnership.mockReturnValue({ success: true });
      mockedFirestoreAdd.mockRejectedValue(new Error("Firestore error"));
      const request = createMockRequest({
        method: "POST",
        body: mockReviewData,
      });
      const response = await POST(request);
      const body = await response.json();
      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "리뷰 생성에 실패했습니다." });
    });
  });

  describe("GET /api/reviews", () => {
    test("기본 페이지네이션으로 리뷰 목록을 성공적으로 가져와야 합니다", async () => {
      // 기본 파라미터로 리뷰 목록 조회 성공
      const mockReviews = {
        data: [{ id: "1", content: "Review 1" }],
        hasMore: false,
      };
      mockedFetchReviewsPaginated.mockResolvedValue(mockReviews);
      const request = createMockRequest({
        method: "GET",
        url: "http://localhost/api/reviews?page=1&pageSize=10",
      });
      const response = await GET(request as NextRequest);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual(mockReviews);
      expect(mockedFetchReviewsPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        uid: undefined,
        search: "",
      });
    });

    test("지정된 페이지네이션 및 uid로 리뷰 목록을 성공적으로 가져와야 합니다", async () => {
      // page, pageSize, uid 파라미터로 리뷰 목록 조회 성공
      const mockReviews = {
        data: [{ id: "2", content: "Review 2" }],
        hasMore: true,
      };
      mockedFetchReviewsPaginated.mockResolvedValue(mockReviews);
      const request = createMockRequest({
        method: "GET",
        url: "http://localhost/api/reviews?page=2&pageSize=5&uid=test-user-id",
      });
      const response = await GET(request as NextRequest);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual(mockReviews);
      expect(mockedFetchReviewsPaginated).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        uid: "test-user-id",
        search: "",
      });
    });

    test("검색어를 포함하여 리뷰 목록을 성공적으로 가져와야 합니다", async () => {
      // search 파라미터로 리뷰 검색 성공
      const mockSearchResults = {
        data: [{ id: "search-1", content: "영화 제목 포함 리뷰" }],
        hasMore: false,
      };
      mockedFetchReviewsPaginated.mockResolvedValue(mockSearchResults);
      const request = createMockRequest({
        method: "GET",
        url: "http://localhost/api/reviews?page=1&pageSize=10&search=영화제목",
      });
      const response = await GET(request as NextRequest);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual(mockSearchResults);
      expect(mockedFetchReviewsPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        uid: undefined,
        search: "영화제목",
      });
    });

    test("uid와 검색어를 함께 포함하여 특정 사용자의 리뷰를 검색해야 합니다", async () => {
      // uid와 search 파라미터로 특정 사용자의 리뷰 검색 성공
      const mockUserSearchResults = {
        data: [{ id: "user-search-1", content: "특정 사용자의 검색 결과" }],
        hasMore: false,
      };
      mockedFetchReviewsPaginated.mockResolvedValue(mockUserSearchResults);
      const request = createMockRequest({
        method: "GET",
        url: "http://localhost/api/reviews?page=1&pageSize=10&uid=user123&search=액션영화",
      });
      const response = await GET(request as NextRequest);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual(mockUserSearchResults);
      expect(mockedFetchReviewsPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        uid: "user123",
        search: "액션영화",
      });
    });
  });
});
