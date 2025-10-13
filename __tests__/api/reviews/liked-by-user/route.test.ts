import { GET } from "@/api/reviews/liked-by-user/route";
import { fetchLikedReviewsPaginated } from "lib/reviews/fetchLikedReviewsPaginated";
import { verifyAuthToken } from "lib/auth/verifyToken";
import { NextRequest } from "next/server";

// Mock 설정
jest.mock("lib/reviews/fetchLikedReviewsPaginated");
jest.mock("lib/auth/verifyToken");

const mockedFetchLikedReviews =
  fetchLikedReviewsPaginated as jest.MockedFunction<
    typeof fetchLikedReviewsPaginated
  >;
const mockedVerifyAuthToken = verifyAuthToken as jest.MockedFunction<
  typeof verifyAuthToken
>;

describe("GET /api/reviews/liked-by-user", () => {
  const mockUserId = "test-user-123";
  const mockReviews = [
    {
      id: "review-1",
      user: {
        uid: mockUserId,
        displayName: "테스트 사용자",
        photoKey: null,
        activityLevel: "ACTIVE",
      },
      review: {
        movieId: 123,
        movieTitle: "테스트 영화",
        originalTitle: "Test Movie",
        moviePosterPath: "/poster.jpg",
        releaseYear: "2024",
        rating: 4.5,
        reviewTitle: "좋은 영화",
        reviewContent: "정말 재미있었습니다.",
        likeCount: 10,
        isLiked: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 인증 성공 설정
    mockedVerifyAuthToken.mockResolvedValue({
      success: true,
      uid: mockUserId,
    });
  });

  describe("인증 검증", () => {
    test("인증되지 않은 요청은 401 에러를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "로그인이 필요합니다.",
        statusCode: 401,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("로그인이 필요합니다.");
      expect(mockedFetchLikedReviews).not.toHaveBeenCalled();
    });

    test("인증 토큰이 유효하지 않으면 적절한 상태 코드를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "유효하지 않은 토큰입니다.",
        statusCode: 403,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(403);
      // API는 uid가 없을 때 항상 "로그인이 필요합니다."를 반환
      expect(body.error).toBe("로그인이 필요합니다.");
    });

    test("uid가 없는 경우 401 에러를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: true,
        uid: undefined,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);

      expect(res.status).toBe(401);
    });
  });

  describe("성공 케이스", () => {
    test("인증된 사용자의 좋아요 리뷰 목록을 반환한다", async () => {
      const mockResult = {
        reviews: mockReviews,
        totalPages: 1,
        totalCount: 1,
      };
      mockedFetchLikedReviews.mockResolvedValue(mockResult);

      const req = new NextRequest(
        "http://localhost/api/reviews/liked-by-user?page=1&pageSize=10",
      );
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual(mockResult);
      expect(body.reviews).toHaveLength(1);
      expect(body.totalPages).toBe(1);
      expect(body.totalCount).toBe(1);
    });

    test("fetchLikedReviewsPaginated에 올바른 파라미터를 전달한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest(
        "http://localhost/api/reviews/liked-by-user?page=2&pageSize=20",
      );
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith({
        uid: mockUserId,
        page: 2,
        pageSize: 20,
        search: "",
      });
    });

    test("좋아요한 리뷰가 없으면 빈 배열을 반환한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.reviews).toEqual([]);
      expect(body.totalPages).toBe(0);
      expect(body.totalCount).toBe(0);
    });
  });

  describe("페이지네이션", () => {
    test("페이지 파라미터가 없으면 기본값 1을 사용한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
        }),
      );
    });

    test("pageSize 파라미터가 없으면 기본값 10을 사용한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 10,
        }),
      );
    });

    test("페이지 파라미터를 정수로 파싱한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest(
        "http://localhost/api/reviews/liked-by-user?page=3&pageSize=15",
      );
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith({
        uid: mockUserId,
        page: 3,
        pageSize: 15,
        search: "",
      });
    });

    test("잘못된 페이지 파라미터는 NaN으로 처리된다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest(
        "http://localhost/api/reviews/liked-by-user?page=invalid",
      );
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          page: NaN,
        }),
      );
    });
  });

  describe("검색 기능", () => {
    test("검색어가 없으면 빈 문자열을 전달한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "",
        }),
      );
    });

    test("검색어를 올바르게 전달한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const searchTerm = "테스트 검색어";
      const req = new NextRequest(
        `http://localhost/api/reviews/liked-by-user?search=${encodeURIComponent(searchTerm)}`,
      );
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith({
        uid: mockUserId,
        page: 1,
        pageSize: 10,
        search: searchTerm,
      });
    });

    test("URL 인코딩된 검색어를 디코딩하여 전달한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: [],
        totalPages: 0,
        totalCount: 0,
      });

      const searchTerm = "한글 검색어 !@#";
      const req = new NextRequest(
        `http://localhost/api/reviews/liked-by-user?search=${encodeURIComponent(searchTerm)}`,
      );
      await GET(req);

      expect(mockedFetchLikedReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          search: searchTerm,
        }),
      );
    });
  });

  describe("에러 처리", () => {
    test("fetchLikedReviewsPaginated에서 에러 발생 시 500 에러를 반환한다", async () => {
      const errorMessage = "데이터베이스 조회 실패";
      mockedFetchLikedReviews.mockRejectedValue(new Error(errorMessage));

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe(errorMessage);
    });

    test("알 수 없는 에러는 기본 메시지를 반환한다", async () => {
      mockedFetchLikedReviews.mockRejectedValue("알 수 없는 에러");

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("서버 오류가 발생했습니다.");
    });

    test("Firestore 에러를 적절히 처리한다", async () => {
      const firestoreError = new Error("Firestore: PERMISSION_DENIED");
      mockedFetchLikedReviews.mockRejectedValue(firestoreError);

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("Firestore: PERMISSION_DENIED");
    });
  });

  describe("응답 구조 검증", () => {
    test("응답이 올바른 구조를 가진다", async () => {
      const mockResult = {
        reviews: mockReviews,
        totalPages: 5,
        totalCount: 50,
      };
      mockedFetchLikedReviews.mockResolvedValue(mockResult);

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      expect(body).toHaveProperty("reviews");
      expect(body).toHaveProperty("totalPages");
      expect(body).toHaveProperty("totalCount");
      expect(Array.isArray(body.reviews)).toBe(true);
    });

    test("리뷰 데이터가 올바른 필드를 포함한다", async () => {
      const mockResult = {
        reviews: mockReviews,
        totalPages: 1,
        totalCount: 1,
      };
      mockedFetchLikedReviews.mockResolvedValue(mockResult);

      const req = new NextRequest("http://localhost/api/reviews/liked-by-user");
      const res = await GET(req);
      const body = await res.json();

      const review = body.reviews[0];
      expect(review).toHaveProperty("id");
      expect(review).toHaveProperty("user");
      expect(review).toHaveProperty("review");
      expect(review.user).toHaveProperty("uid");
      expect(review.user).toHaveProperty("displayName");
      expect(review.user).toHaveProperty("activityLevel");
      expect(review.review).toHaveProperty("isLiked", true);
    });
  });

  describe("통합 시나리오", () => {
    test("인증 + 페이지네이션 + 검색이 모두 함께 동작한다", async () => {
      mockedFetchLikedReviews.mockResolvedValue({
        reviews: mockReviews,
        totalPages: 3,
        totalCount: 25,
      });

      const req = new NextRequest(
        "http://localhost/api/reviews/liked-by-user?page=2&pageSize=10&search=영화",
      );
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(mockedVerifyAuthToken).toHaveBeenCalledWith(req);
      expect(mockedFetchLikedReviews).toHaveBeenCalledWith({
        uid: mockUserId,
        page: 2,
        pageSize: 10,
        search: "영화",
      });
      expect(body.reviews).toBeDefined();
      expect(body.totalPages).toBe(3);
    });
  });
});
