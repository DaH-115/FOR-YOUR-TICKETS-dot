import { render, screen, fireEvent } from "@testing-library/react";
import CommentItem from "@/components/review/comment/CommentItem";
import { Comment } from "@/components/review/comment/hooks/useComments";

// Mock components
jest.mock("@/components/ui/feedback/ActivityBadge", () => {
  return function MockActivityBadge({
    activityLevel,
  }: {
    activityLevel: string;
  }) {
    return <span data-testid="activity-badge">{activityLevel}</span>;
  };
});

jest.mock("@/components/user/ProfileAvatar", () => {
  return function MockProfileAvatar({
    userDisplayName,
  }: {
    userDisplayName: string;
  }) {
    return <div data-testid="profile-avatar">{userDisplayName}</div>;
  };
});

jest.mock("@/utils/formatDate", () => {
  return jest.fn(() => "2023-01-01");
});

describe("CommentItem", () => {
  const mockComment: Comment = {
    id: "comment123",
    authorId: "user123",
    displayName: "테스트 사용자",
    photoKey: "photo123",
    content: "테스트 댓글 내용",
    activityLevel: "ACTIVE",
    createdAt: "2023-01-01T00:00:00Z",
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("댓글 정보가 올바르게 렌더링되어야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user456"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getAllByText("테스트 사용자")).toHaveLength(2); // ProfileAvatar와 p 태그에 각각 표시
    expect(screen.getByText("테스트 댓글 내용")).toBeInTheDocument();
    expect(screen.getByTestId("activity-badge")).toBeInTheDocument();
  });

  test("댓글 작성자일 때 작성자 배지가 표시되어야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="user123" // 댓글 작성자와 동일
        currentUserId="user456"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("작성자")).toBeInTheDocument();
  });

  test("현재 사용자가 댓글 작성자일 때 수정/삭제 버튼이 표시되어야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user123" // 댓글 작성자와 동일
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("수정")).toBeInTheDocument();
    expect(screen.getByText("삭제")).toBeInTheDocument();
  });

  test("현재 사용자가 댓글 작성자가 아닐 때 수정/삭제 버튼이 표시되지 않아야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user456" // 다른 사용자
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByText("수정")).not.toBeInTheDocument();
    expect(screen.queryByText("삭제")).not.toBeInTheDocument();
  });

  test("수정 버튼 클릭 시 onEdit이 호출되어야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user123"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByText("수정"));

    expect(mockOnEdit).toHaveBeenCalledWith("comment123", "테스트 댓글 내용");
  });

  test("삭제 버튼 클릭 시 onDelete이 호출되어야 함", () => {
    render(
      <CommentItem
        comment={mockComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user123"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByText("삭제"));

    expect(mockOnDelete).toHaveBeenCalledWith("comment123");
  });

  test("임시 댓글일 때 등록 중 배지가 표시되어야 함", () => {
    const tempComment = {
      ...mockComment,
      id: "temp-1234567890", // 임시 ID
    };

    render(
      <CommentItem
        comment={tempComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user123"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("등록 중...")).toBeInTheDocument();
  });

  test("임시 댓글일 때 수정/삭제 버튼이 표시되지 않아야 함", () => {
    const tempComment = {
      ...mockComment,
      id: "temp-1234567890", // 임시 ID
    };

    render(
      <CommentItem
        comment={tempComment}
        index={0}
        isLast={false}
        reviewAuthorId="reviewer123"
        currentUserId="user123"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByText("수정")).not.toBeInTheDocument();
    expect(screen.queryByText("삭제")).not.toBeInTheDocument();
  });
});
