import { renderHook, act } from "@testing-library/react";
import { useComments } from "@/components/review/comment/hooks/useComments";
import { useAlert } from "store/context/alertContext";

// Mock dependencies
jest.mock("@/utils/getIdToken/apiCallWithTokenRefresh");
jest.mock("@/utils/firebaseError");
jest.mock("firebase-config");
jest.mock("store/context/alertContext");

const mockApiCallWithTokenRefresh =
  require("@/utils/getIdToken/apiCallWithTokenRefresh").apiCallWithTokenRefresh;
const mockFirebaseErrorHandler =
  require("@/utils/firebaseError").firebaseErrorHandler;
const mockIsAuth = require("firebase-config").isAuth;
const mockUseAlert = useAlert as jest.MockedFunction<typeof useAlert>;

// Mock the useAlert hook
jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));

describe("useComments", () => {
  const mockUserState = {
    uid: "user123",
    displayName: "테스트 사용자",
    photoKey: "photo123",
    activityLevel: "ACTIVE",
  };

  const mockShowErrorHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      showErrorHandler: mockShowErrorHandler,
    });
    mockIsAuth.currentUser = { uid: "user123" };

    // Mock fetch
    global.fetch = jest.fn();
  });

  describe("댓글 생성", () => {
    it("댓글 생성 성공 시 낙관적 업데이트가 작동해야 함", async () => {
      const { result } = renderHook(() =>
        useComments({ reviewId: "review123", userState: mockUserState }),
      );

      // 초기 상태 확인
      expect(result.current.comments).toEqual([]);
      expect(result.current.isPosting).toBe(false);

      // Mock API 성공 응답
      mockApiCallWithTokenRefresh.mockResolvedValue({ id: "comment456" });

      // 댓글 생성 실행
      await act(async () => {
        await result.current.createComment("테스트 댓글");
      });

      // 낙관적 업데이트 확인: 댓글이 즉시 추가되어야 함
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].content).toBe("테스트 댓글");
      expect(result.current.comments[0].id).toBe("comment456"); // 실제 ID로 교체됨
    });

    it("댓글 생성 실패 시 롤백이 작동해야 함", async () => {
      const { result } = renderHook(() =>
        useComments({ reviewId: "review123", userState: mockUserState }),
      );

      // Mock API 실패
      mockApiCallWithTokenRefresh.mockRejectedValue(new Error("API 오류"));
      mockFirebaseErrorHandler.mockReturnValue({ message: "댓글 생성 실패" });

      // 댓글 생성 실행
      await act(async () => {
        try {
          await result.current.createComment("테스트 댓글");
        } catch (error) {
          // 에러는 예상됨
        }
      });

      // 롤백 확인: 댓글이 제거되어야 함
      expect(result.current.comments).toHaveLength(0);
      expect(mockShowErrorHandler).toHaveBeenCalledWith(
        "오류",
        "댓글 생성 실패",
      );
    });
  });

  describe("댓글 수정", () => {
    it("댓글 수정 시 낙관적 업데이트가 작동해야 함", async () => {
      const { result } = renderHook(() =>
        useComments({ reviewId: "review123", userState: mockUserState }),
      );

      // 초기 댓글 설정
      act(() => {
        result.current.comments.push({
          id: "comment123",
          authorId: "user123",
          displayName: "테스트 사용자",
          photoKey: "photo123",
          content: "원래 내용",
          activityLevel: "ACTIVE",
          createdAt: "2023-01-01T00:00:00Z",
        });
      });

      // Mock API 성공
      mockApiCallWithTokenRefresh.mockResolvedValue({});

      // 댓글 수정 실행
      await act(async () => {
        await result.current.updateComment("comment123", "수정된 내용");
      });

      // 낙관적 업데이트 확인
      const updatedComment = result.current.comments.find(
        (c) => c.id === "comment123",
      );
      expect(updatedComment?.content).toBe("수정된 내용");
      expect(updatedComment?.updatedAt).toBeDefined();
    });
  });

  describe("댓글 삭제", () => {
    it("댓글 삭제 시 낙관적 업데이트가 작동해야 함", async () => {
      const { result } = renderHook(() =>
        useComments({ reviewId: "review123", userState: mockUserState }),
      );

      // 초기 댓글 설정
      act(() => {
        result.current.comments.push({
          id: "comment123",
          authorId: "user123",
          displayName: "테스트 사용자",
          photoKey: "photo123",
          content: "삭제될 댓글",
          activityLevel: "ACTIVE",
          createdAt: "2023-01-01T00:00:00Z",
        });
      });

      // Mock confirm과 API 성공
      global.confirm = jest.fn(() => true);
      mockApiCallWithTokenRefresh.mockResolvedValue({});

      // 댓글 삭제 실행
      await act(async () => {
        await result.current.deleteComment("comment123");
      });

      // 낙관적 업데이트 확인: 댓글이 즉시 제거되어야 함
      expect(result.current.comments).toHaveLength(0);
    });
  });
});
