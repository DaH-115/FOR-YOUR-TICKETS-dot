import { render, screen } from "@testing-library/react";
import ReviewTicket from "@/components/review/ReviewTicket";

describe("ReviewTicket 렌더링 테스트", () => {
  // 좋아요하지 않은 상태의 리뷰
  const mockReviews = [
    {
      id: "review1",
      user: {
        uid: "user1",
        displayName: "테스터1",
        photoKey: null,
        activityLevel: "NOVICE",
      },
      review: {
        movieId: 1,
        movieTitle: "영화 제목1",
        originalTitle: "Movie Title 1",
        moviePosterPath: "/poster1.jpg",
        releaseYear: "2023",
        rating: 5,
        reviewTitle: "재미있는 영화1",
        reviewContent: "정말 재미있어요.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
      },
    },
  ];

  // 이미 좋아요한 상태의 리뷰
  const mockReviewLiked = [
    {
      id: "review1",
      user: {
        uid: "user1",
        displayName: "테스터1",
        photoKey: null,
        activityLevel: "NOVICE",
      },
      review: {
        movieId: 1,
        movieTitle: "영화 제목1",
        originalTitle: "Movie Title 1",
        moviePosterPath: "/poster1.jpg",
        releaseYear: "2023",
        rating: 5,
        reviewTitle: "재미있는 영화1",
        reviewContent: "정말 재미있어요.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 1,
        isLiked: true,
      },
    },
  ];

  test("좋아요하지 않은 리뷰가 올바르게 렌더링된다", () => {
    render(<ReviewTicket review={mockReviews[0]} />);

    // 기본 정보들이 올바르게 표시되는지 확인
    expect(screen.getByText("테스터1")).toBeInTheDocument();
    expect(screen.getByText('"재미있는 영화1"')).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("영화 제목1 (2023)")).toBeInTheDocument();
  });

  test("좋아요한 리뷰가 올바르게 렌더링된다", () => {
    render(<ReviewTicket review={mockReviewLiked[0]} />);

    // 기본 정보들이 올바르게 표시되는지 확인
    expect(screen.getByText("테스터1")).toBeInTheDocument();
    expect(screen.getByText('"재미있는 영화1"')).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("영화 제목1 (2023)")).toBeInTheDocument();
  });

  test("프로필 아바타가 올바르게 렌더링된다", () => {
    render(<ReviewTicket review={mockReviews[0]} />);

    const avatar = screen.getByTestId("profile-avatar");
    expect(avatar).toBeInTheDocument();
  });
});
