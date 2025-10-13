import { renderHook, act } from "@testing-library/react";
import { useComments } from "@/components/review/comment/hooks/useComments";
import { useAlert } from "store/context/alertContext";
import { apiCallWithTokenRefresh } from "@/utils/getIdToken/apiCallWithTokenRefresh";
import { firebaseErrorHandler } from "@/utils/firebaseError";
import { isAuth } from "firebase-config";

// Mock dependencies
jest.mock("@/utils/getIdToken/apiCallWithTokenRefresh");
jest.mock("@/utils/firebaseError");
jest.mock("firebase-config");
jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));

const mockApiCallWithTokenRefresh =
  apiCallWithTokenRefresh as jest.MockedFunction<
    typeof apiCallWithTokenRefresh
  >;
const mockFirebaseErrorHandler = firebaseErrorHandler as jest.MockedFunction<
  typeof firebaseErrorHandler
>;
const mockIsAuth = isAuth as jest.Mocked<typeof isAuth>;
const mockUseAlert = useAlert as jest.MockedFunction<typeof useAlert>;

describe("useComments", () => {
  const mockUserState = {
    uid: "user123",
    displayName: "테스트 사용자",
    photoKey: "photo123",
    activityLevel: "ACTIVE",
  };

  const mockShowErrorHandler = jest.fn();
  const mockShowSuccessHandler = jest.fn();
  const mockHideErrorHandler = jest.fn();
  const mockHideSuccessHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useAlert mock 설정
    mockUseAlert.mockReturnValue({
      showErrorHandler: mockShowErrorHandler,
      showSuccessHandler: mockShowSuccessHandler,
      hideErrorHandler: mockHideErrorHandler,
      hideSuccessHandler: mockHideSuccessHandler,
    });

    // currentUser를 읽기 전용 속성이므로 Object.defineProperty 사용
    Object.defineProperty(mockIsAuth, "currentUser", {
      value: { uid: "user123" },
      writable: true,
      configurable: true,
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  describe("댓글 생성", () => {
    test("댓글 생성 성공 시 낙관적 업데이트가 작동해야 함", async () => {
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

    test("댓글 생성 실패 시 롤백이 작동해야 함", async () => {
      const { result } = renderHook(() =>
        useComments({ reviewId: "review123", userState: mockUserState }),
      );

      // Mock API 실패
      mockApiCallWithTokenRefresh.mockRejectedValue(new Error("API 오류"));
      mockFirebaseErrorHandler.mockReturnValue({
        title: "오류",
        message: "댓글 생성 실패",
      });

      // 댓글 생성 실행
      await act(async () => {
        try {
          await result.current.createComment("테스트 댓글");
        } catch {
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
    test("댓글 수정 시 낙관적 업데이트가 작동해야 함", async () => {
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
    test("댓글 삭제 시 낙관적 업데이트가 작동해야 함", async () => {
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
