import { render, screen } from "@testing-library/react";
import CommentList from "@/components/review/comment/CommentList";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { useComments } from "@/components/review/comment/hooks/useComments";
import { useCommentForm } from "@/components/review/comment/hooks/useCommentForm";

// Mock hooks
jest.mock("store/redux-toolkit/hooks");
jest.mock("@/components/review/comment/hooks/useComments");
jest.mock("@/components/review/comment/hooks/useCommentForm");

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;
const mockUseComments = useComments as jest.MockedFunction<typeof useComments>;
const mockUseCommentForm = useCommentForm as jest.MockedFunction<
  typeof useCommentForm
>;

describe("CommentList", () => {
  const mockUserState = {
    uid: "user123",
    displayName: "테스트 사용자",
    photoKey: "photo123",
    activityLevel: "ACTIVE",
  };

  const mockComments = [
    {
      id: "comment1",
      authorId: "user123",
      displayName: "테스트 사용자",
      photoKey: "photo123",
      content: "첫 번째 댓글",
      activityLevel: "ACTIVE",
      createdAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "comment2",
      authorId: "user456",
      displayName: "다른 사용자",
      photoKey: null,
      content: "두 번째 댓글",
      activityLevel: "NEWBIE",
      createdAt: "2023-01-01T01:00:00Z",
    },
  ];

  const mockUseCommentsReturn = {
    comments: mockComments,
    isLoading: false,
    isPosting: false,
    fetchComments: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  const mockUseCommentFormReturn = {
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    errors: {},
    isSubmitting: false,
    editingId: null,
    startEdit: jest.fn(),
    cancelEdit: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAppSelector.mockReturnValue(mockUserState);
    mockUseComments.mockReturnValue(mockUseCommentsReturn);
    mockUseCommentForm.mockReturnValue(mockUseCommentFormReturn);
  });

  test("댓글 목록이 올바르게 렌더링되어야 함", () => {
    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(screen.getByText("댓글 2")).toBeInTheDocument();
    expect(screen.getByText("첫 번째 댓글")).toBeInTheDocument();
    expect(screen.getByText("두 번째 댓글")).toBeInTheDocument();
  });

  test("로딩 중일 때 로딩 스피너가 표시되어야 함", () => {
    mockUseComments.mockReturnValue({
      ...mockUseCommentsReturn,
      isLoading: true,
    });

    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(screen.getByText("댓글을 불러오는 중...")).toBeInTheDocument();
  });

  test("댓글이 없을 때 댓글 목록이 숨겨져야 함", () => {
    mockUseComments.mockReturnValue({
      ...mockUseCommentsReturn,
      comments: [],
    });

    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(screen.getByText("댓글 0")).toBeInTheDocument();
    expect(screen.queryByText("첫 번째 댓글")).not.toBeInTheDocument();
  });

  test("사용자가 로그인하지 않았을 때 댓글 폼이 표시되지 않아야 함", () => {
    mockUseAppSelector.mockReturnValue(null);

    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(
      screen.queryByPlaceholderText("댓글을 입력하세요"),
    ).not.toBeInTheDocument();
  });

  test("댓글 폼이 올바르게 렌더링되어야 함", () => {
    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(
      screen.getByPlaceholderText("댓글을 입력하세요"),
    ).toBeInTheDocument();
    expect(screen.getByText("등록")).toBeInTheDocument();
  });

  test("수정 모드일 때 폼이 수정 상태로 표시되어야 함", () => {
    mockUseCommentForm.mockReturnValue({
      ...mockUseCommentFormReturn,
      editingId: "comment1",
    });

    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(screen.getByText("수정 완료")).toBeInTheDocument();
    expect(screen.getByText("취소")).toBeInTheDocument();
  });

  test("훅들이 올바른 props로 호출되어야 함", () => {
    render(<CommentList id="review123" reviewAuthorId="reviewer123" />);

    expect(mockUseComments).toHaveBeenCalledWith({
      reviewId: "review123",
      userState: {
        uid: "user123",
        displayName: "테스트 사용자",
        photoKey: "photo123",
        activityLevel: "ACTIVE",
      },
    });

    expect(mockUseCommentForm).toHaveBeenCalledWith({
      onSubmit: mockUseCommentsReturn.createComment,
      onUpdate: mockUseCommentsReturn.updateComment,
      isPosting: false,
    });
  });
});
