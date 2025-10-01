import { render, screen, fireEvent, act } from "@testing-library/react";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";

// usePresignedUrl 훅 모킹
jest.mock("@/components/user/hooks/usePresignedUrl", () => ({
  usePresignedUrl: jest.fn(),
}));

const mockUsePresignedUrl = usePresignedUrl as jest.MockedFunction<
  typeof usePresignedUrl
>;

// Intersection Observer 모킹
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe("ProfileAvatar 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePresignedUrl.mockReturnValue({
      url: "",
      loading: false,
      error: null,
    });
  });

  describe("기본 렌더링", () => {
    test("사용자 이름만 있을 때 첫 글자로 아바타를 표시한다", () => {
      render(<ProfileAvatar userDisplayName="테스트사용자" />);

      const avatar = screen.getByTestId("profile-avatar");
      const firstLetter = screen.getByText("테");

      expect(avatar).toBeInTheDocument();
      expect(firstLetter).toBeInTheDocument();
    });

    test("사용자 이름이 없을 때 'U'를 표시한다", () => {
      render(<ProfileAvatar userDisplayName="" />);

      const firstLetter = screen.getByText("U");
      expect(firstLetter).toBeInTheDocument();
    });

    test("s3photoKey가 있을 때 presigned URL을 사용한다", () => {
      mockUsePresignedUrl.mockReturnValue({
        url: "https://s3.amazonaws.com/presigned-url.jpg",
        loading: false,
        error: null,
      });

      render(
        <ProfileAvatar
          userDisplayName="S3사용자"
          s3photoKey="photos/user123.jpg"
        />,
      );

      const img = screen.getByAltText("S3사용자");
      expect(img).toBeInTheDocument();
      // Next.js Image 컴포넌트는 URL을 _next/image 경로로 변환하므로 이를 확인
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("presigned-url.jpg"),
      );
    });

    test("previewSrc가 있을 때 미리보기 이미지를 사용한다", () => {
      render(
        <ProfileAvatar
          userDisplayName="미리보기사용자"
          previewSrc="https://example.com/preview.jpg"
        />,
      );

      const img = screen.getByAltText("미리보기사용자");
      expect(img).toBeInTheDocument();
      // Next.js Image 컴포넌트는 URL을 _next/image 경로로 변환하므로 이를 확인
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("preview.jpg"),
      );
    });

    test("이미지 로딩 중일 때 로딩 스피너를 표시한다", () => {
      mockUsePresignedUrl.mockReturnValue({
        url: "",
        loading: true,
        error: null,
      });

      render(
        <ProfileAvatar
          userDisplayName="로딩사용자"
          s3photoKey="photos/loading.jpg"
        />,
      );

      const loadingSpinner = screen.getByLabelText("로딩 중");
      expect(loadingSpinner).toBeInTheDocument();
    });

    test("이미지 로딩 실패 시 첫 글자로 폴백한다", async () => {
      mockUsePresignedUrl.mockReturnValue({
        url: "https://s3.amazonaws.com/invalid.jpg",
        loading: false,
        error: null,
      });

      render(
        <ProfileAvatar
          userDisplayName="실패사용자"
          s3photoKey="photos/invalid.jpg"
        />,
      );

      // 이미지가 렌더링될 때까지 기다림
      const img = screen.getByAltText("실패사용자");
      expect(img).toBeInTheDocument();

      // 이미지 로딩 실패를 시뮬레이션
      act(() => {
        fireEvent.error(img);
      });

      // 첫 글자가 표시될 때까지 기다림
      await screen.findByText("실");
      const firstLetter = screen.getByText("실");
      expect(firstLetter).toBeInTheDocument();
    });
  });

  describe("Props 테스트", () => {
    test("size prop이 올바르게 적용된다", () => {
      render(<ProfileAvatar userDisplayName="크기테스트" size={100} />);

      const avatar = screen.getByTestId("profile-avatar");
      expect(avatar).toHaveStyle({ width: "100px", height: "100px" });
    });

    test("className prop이 올바르게 적용된다", () => {
      render(
        <ProfileAvatar
          userDisplayName="클래스테스트"
          className="custom-avatar"
        />,
      );

      const avatar = screen.getByTestId("profile-avatar");
      expect(avatar).toHaveClass("custom-avatar");
    });

    test("usePresignedUrl이 올바른 파라미터로 호출된다", () => {
      // Intersection Observer 콜백을 즉시 실행하도록 설정
      let observerCallback: (entries: IntersectionObserverEntry[]) => void;
      mockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: () => {
            // 즉시 visible 상태로 변경
            setTimeout(
              () =>
                observerCallback([
                  { isIntersecting: true },
                ] as IntersectionObserverEntry[]),
              0,
            );
          },
          unobserve: () => null,
          disconnect: () => null,
        };
      });

      render(
        <ProfileAvatar
          userDisplayName="사용자"
          s3photoKey="public-photos/123.jpg"
        />,
      );

      // 초기에는 key가 null로 호출되어야 함 (Intersection Observer가 트리거되기 전)
      expect(mockUsePresignedUrl).toHaveBeenCalledWith({
        key: null,
      });
    });

    test("showLoading이 false일 때 로딩 스피너를 표시하지 않는다", () => {
      mockUsePresignedUrl.mockReturnValue({
        url: "",
        loading: true,
        error: null,
      });

      render(
        <ProfileAvatar
          userDisplayName="로딩사용자"
          s3photoKey="photos/loading.jpg"
          showLoading={false}
        />,
      );

      const loadingSpinner = screen.queryByLabelText("로딩 중");
      expect(loadingSpinner).not.toBeInTheDocument();
    });
  });

  describe("이미지 에러 처리", () => {
    test("onImageError 콜백이 호출된다", () => {
      const mockOnImageError = jest.fn();
      mockUsePresignedUrl.mockReturnValue({
        url: "https://s3.amazonaws.com/invalid.jpg",
        loading: false,
        error: null,
      });

      render(
        <ProfileAvatar
          userDisplayName="에러사용자"
          s3photoKey="photos/invalid.jpg"
          onImageError={mockOnImageError}
        />,
      );

      const img = screen.getByAltText("에러사용자");
      act(() => {
        img.dispatchEvent(new Event("error"));
      });

      expect(mockOnImageError).toHaveBeenCalledTimes(1);
    });
  });
});
