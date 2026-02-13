import { GET } from "app/api/reviews/[id]/get.handler";
import { NextRequest } from "next/server";

jest.mock("firebase-admin-config", () => {
  const mockLikeDoc = {
    get: jest.fn(),
  };
  const mockLikeCollection = {
    doc: jest.fn(() => mockLikeDoc),
  };
  const mockCountQuery = {
    get: jest.fn().mockResolvedValue({
      data: () => ({ count: 0 }),
    }),
  };
  const mockDoc = {
    get: jest.fn(),
    collection: jest.fn(() => mockLikeCollection),
  };
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    where: jest.fn().mockReturnValue({
      count: jest.fn().mockReturnValue(mockCountQuery),
    }),
  };
  return {
    adminFirestore: {
      collection: jest.fn(() => mockCollection),
    },
    mockDoc,
    mockLikeDoc,
    mockCountQuery,
  };
});

const { mockDoc, mockLikeDoc } = jest.requireMock("firebase-admin-config");

describe("GET /api/reviews/[id]", () => {
  const mockReviewId = "test-review-id";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockDoc.get.mockClear();
    mockLikeDoc.get.mockClear();
  });

  test("성공적으로 개별 리뷰를 조회하고 200 상태 코드를 반환해야 합니다", async () => {
    // 정상적으로 Firestore에 해당 ID의 리뷰 문서가 존재하는 경우
    const mockReviewData = {
      user: {
        uid: "user1",
        displayName: "테스터",
        photoKey: null,
        activityLevel: "NOVICE",
      },
      review: {
        movieId: 1,
        movieTitle: "테스트 영화",
        originalTitle: "Test Movie",
        moviePosterPath: "/poster.jpg",
        releaseYear: "2023",
        rating: 5,
        reviewTitle: "Test Review",
        reviewContent: "A great movie.",
        createdAt: {
          toDate: () => new Date("2023-01-01T00:00:00.000Z"),
        },
        updatedAt: {
          toDate: () => new Date("2023-01-01T00:00:00.000Z"),
        },
        likeCount: 5,
      },
      likeCount: 5,
    };

    // adminFirestore.collection("movie-reviews").doc(id).get() 호출 결과 모킹
    mockDoc.get.mockResolvedValue({
      exists: true,
      id: mockReviewId,
      data: () => mockReviewData,
    });

    // 좋아요 상태 확인 모킹
    mockLikeDoc.get.mockResolvedValue({ exists: false });

    // NextRequest 모킹
    const mockRequest = {
      nextUrl: {
        searchParams: {
          get: jest.fn().mockReturnValue("user1"),
        },
      },
      headers: {
        get: jest.fn().mockReturnValue(null), // 인증 헤더 없음 (공개 조회)
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();

    // 실제 에러 메시지 확인
    if (response.status !== 200) {
      console.error("API 에러:", body);
    }

    expect(response.status).toBe(200);
    expect(body.id).toBe(mockReviewId);
    expect(body.user).toEqual(mockReviewData.user);
    expect(body.review.isLiked).toBe(false);
  });

  test("리뷰를 찾을 수 없으면 404 에러를 반환해야 합니다", async () => {
    // 리뷰 문서가 존재하지 않을 때 404 반환
    mockDoc.get.mockResolvedValue({ exists: false });

    // NextRequest 모킹
    const mockRequest = {
      nextUrl: {
        searchParams: {
          get: jest.fn().mockReturnValue(null),
        },
      },
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error).toBe("리뷰를 찾을 수 없습니다.");
  });

  test("리뷰 조회 중 서버 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
    // Firestore의 get 함수에서 에러가 발생하는 경우 500 반환
    mockDoc.get.mockRejectedValue(new Error("DB 조회 오류"));

    // NextRequest 모킹
    const mockRequest = {
      nextUrl: {
        searchParams: {
          get: jest.fn().mockReturnValue(null),
        },
      },
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("리뷰 조회에 실패했습니다.");
  });
});
