import { GET } from "app/api/reviews/[id]/comments/get.handler";
import { NextRequest } from "next/server";
import { createMockRequest } from "__tests__/utils/test-utils";

const mockUserDoc = { get: jest.fn() };
const mockUserCollection = { doc: jest.fn(() => mockUserDoc) };
const mockCommentsQuery = { docs: [] as unknown[], get: jest.fn() };
const mockSubCollection = {
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn(() => Promise.resolve(mockCommentsQuery)),
};
const mockMainDoc = { collection: jest.fn(() => mockSubCollection) };
const mockReviewsCollection = { doc: jest.fn(() => mockMainDoc) };

jest.mock("firebase-admin-config", () => ({
  adminFirestore: {
    collection: jest.fn((name) => {
      if (name === "users") return mockUserCollection;
      if (name === "movie-reviews") return mockReviewsCollection;
      return { doc: jest.fn(() => ({ collection: jest.fn() })) };
    }),
  },
}));

describe("GET /api/reviews/[id]/comments", () => {
  const mockReviewId = "test-review-id";

  beforeEach(() => {
    // 각 테스트 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockCommentsQuery.docs = [];
    mockUserDoc.get.mockClear();
    (mockSubCollection.orderBy as jest.Mock).mockClear();
    (mockSubCollection.get as jest.Mock).mockClear();
    (mockReviewsCollection.doc as jest.Mock).mockClear();
    (mockUserCollection.doc as jest.Mock).mockClear();
  });

  test("성공적으로 댓글 목록과 사용자 정보를 조회해야 합니다", async () => {
    // 정상적으로 댓글과 사용자 정보가 모두 존재하는 경우
    const mockCommentData = [
      { id: "comment1", authorId: "user1", content: "Great comment!" },
      { id: "comment2", authorId: "user2", content: "Another one." },
    ];
    mockCommentsQuery.docs = mockCommentData.map((c) => ({
      id: c.id,
      data: () => c,
    }));
    mockUserDoc.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          displayName: "User One",
          photoKey: "key1",
          activityLevel: "PRO",
        }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          displayName: "User Two",
          photoKey: "key2",
          activityLevel: "MASTER",
        }),
      });
    const request = createMockRequest({ method: "GET" });
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.comments).toHaveLength(2);
    expect(body.comments[0].displayName).toBe("User One");
    expect(body.comments[1].displayName).toBe("User Two");
    expect(body.comments[0].activityLevel).toBe("PRO");
    expect(body.comments[1].activityLevel).toBe("MASTER");
    expect(mockReviewsCollection.doc).toHaveBeenCalledWith(mockReviewId);
    expect(mockUserCollection.doc).toHaveBeenCalledWith("user1");
    expect(mockUserCollection.doc).toHaveBeenCalledWith("user2");
  });

  test("사용자 정보 조회를 실패해도 댓글의 기본 정보로 응답해야 합니다", async () => {
    // 댓글은 있지만, 사용자 정보가 존재하지 않는 경우
    const mockCommentData = [
      {
        id: "comment1",
        authorId: "user1",
        content: "Test",
        displayName: "Fallback Name",
      },
    ];
    mockCommentsQuery.docs = mockCommentData.map((c) => ({
      id: c.id,
      data: () => c,
    }));
    mockUserDoc.get.mockResolvedValue({ exists: false });
    const request = createMockRequest({ method: "GET" });
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.comments[0].displayName).toBe("Fallback Name");
  });

  test("댓글 조회 중 DB 오류가 발생하면 500 에러를 반환해야 합니다", async () => {
    // 댓글 컬렉션 조회에서 에러가 발생하는 경우 500 반환
    (mockSubCollection.get as jest.Mock).mockRejectedValue(
      new Error("DB Connection Error"),
    );
    const request = createMockRequest({ method: "GET" });
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ id: mockReviewId }),
    });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("댓글 조회에 실패했습니다.");
  });
});
