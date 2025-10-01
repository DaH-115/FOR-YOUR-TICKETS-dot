import { render, screen } from "@testing-library/react";
import ActivityBadge from "app/components/ui/feedback/ActivityBadge";

describe("ActivityBadge 컴포넌트 테스트", () => {
  describe("등급 표시 기능", () => {
    it("유효한 활동 레벨이 전달되었을 때 해당 등급을 표시해야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      expect(screen.getByText("EXPERT")).toBeInTheDocument();
      expect(screen.getByTitle("활동 등급: EXPERT")).toBeInTheDocument();
    });

    it("NEWBIE 등급이 전달되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="NEWBIE" />);

      const badge = screen.getByText("NEWBIE");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-700");
    });

    it("REGULAR 등급이 전달되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="REGULAR" />);

      const badge = screen.getByText("REGULAR");
      expect(badge).toHaveClass("bg-green-100", "text-green-700");
    });

    it("ACTIVE 등급이 전달되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="ACTIVE" />);

      const badge = screen.getByText("ACTIVE");
      expect(badge).toHaveClass("bg-blue-100", "text-blue-700");
    });

    it("EXPERT 등급이 전달되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("bg-purple-100", "text-purple-700");
    });
  });

  describe("기본값 처리", () => {
    it("활동 레벨이 전달되지 않았을 때 NEWBIE를 기본값으로 표시해야 한다", () => {
      render(<ActivityBadge />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
      expect(screen.getByTitle("활동 등급: NEWBIE")).toBeInTheDocument();
    });

    it("잘못된 활동 레벨이 전달되었을 때 NEWBIE를 기본값으로 표시해야 한다", () => {
      render(<ActivityBadge activityLevel="INVALID_LEVEL" />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });

    it("빈 문자열이 전달되었을 때 NEWBIE를 기본값으로 표시해야 한다", () => {
      render(<ActivityBadge activityLevel="" />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });
  });

  describe("크기 옵션", () => {
    it("tiny 크기가 적용되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" size="tiny" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("p-1", "text-[10px]", "leading-none");
    });

    it("small 크기가 적용되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" size="small" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("px-2", "py-0.5", "text-xs");
    });

    it("medium 크기가 적용되었을 때 올바른 스타일이 적용되어야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" size="medium" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("px-3", "py-1", "text-sm");
    });

    it("크기가 전달되지 않았을 때 tiny를 기본값으로 사용해야 한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("p-1", "text-[10px]", "leading-none");
    });
  });

  describe("커스텀 스타일", () => {
    it("추가 className이 전달되었을 때 올바르게 적용되어야 한다", () => {
      render(
        <ActivityBadge
          activityLevel="EXPERT"
          className="custom-class another-class"
        />,
      );

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("custom-class", "another-class");
    });

    it("기본 스타일과 커스텀 스타일이 함께 적용되어야 한다", () => {
      render(
        <ActivityBadge
          activityLevel="EXPERT"
          size="small"
          className="custom-class"
        />,
      );

      const badge = screen.getByText("EXPERT");
      // 기본 스타일들
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-full",
        "font-medium",
      );
      // 크기 스타일
      expect(badge).toHaveClass("px-2", "py-0.5", "text-xs");
      // 등급 스타일
      expect(badge).toHaveClass("bg-purple-100", "text-purple-700");
      // 커스텀 스타일
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("접근성", () => {
    it("툴팁이 올바르게 설정되어야 한다", () => {
      render(<ActivityBadge activityLevel="ACTIVE" />);

      expect(screen.getByTitle("활동 등급: ACTIVE")).toBeInTheDocument();
    });

    it("기본값일 때도 툴팁이 올바르게 설정되어야 한다", () => {
      render(<ActivityBadge />);

      expect(screen.getByTitle("활동 등급: NEWBIE")).toBeInTheDocument();
    });
  });

  describe("중앙화된 데이터 시스템 통합", () => {
    it("getActivityLevelInfo 함수의 결과를 올바르게 사용해야 한다", () => {
      // 각 등급별로 중앙화된 시스템에서 제공하는 색상이 올바르게 적용되는지 확인
      const testCases = [
        {
          level: "NEWBIE",
          expectedColors: ["bg-yellow-100", "text-yellow-700"],
        },
        {
          level: "REGULAR",
          expectedColors: ["bg-green-100", "text-green-700"],
        },
        { level: "ACTIVE", expectedColors: ["bg-blue-100", "text-blue-700"] },
        {
          level: "EXPERT",
          expectedColors: ["bg-purple-100", "text-purple-700"],
        },
      ];

      testCases.forEach(({ level, expectedColors }) => {
        const { unmount } = render(<ActivityBadge activityLevel={level} />);

        const badge = screen.getByText(level);
        expectedColors.forEach((color) => {
          expect(badge).toHaveClass(color);
        });

        unmount();
      });
    });

    it("잘못된 등급이 전달되어도 안전하게 기본값으로 처리되어야 한다", () => {
      // getActivityLevelInfo 함수가 잘못된 입력에 대해 안전하게 NEWBIE를 반환하는지 확인
      render(<ActivityBadge activityLevel="UNKNOWN_LEVEL" />);

      const badge = screen.getByText("NEWBIE");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-700");
    });
  });
});
