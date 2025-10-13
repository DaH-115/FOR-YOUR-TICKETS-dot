import { render, screen } from "@testing-library/react";
import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import { gradeInfoData } from "lib/utils/getActivityLevel";

describe("ActivityBadge 컴포넌트", () => {
  describe("기본 렌더링", () => {
    test("활동 레벨과 함께 배지를 렌더링한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      expect(screen.getByText("EXPERT")).toBeInTheDocument();
    });

    test("기본 스타일 클래스가 적용된다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-full",
      );
    });

    test("고정 크기 스타일이 적용된다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass(
        "px-1.5",
        "py-1",
        "text-[10px]",
        "leading-none",
      );
    });
  });

  describe("등급별 색상 적용", () => {
    // gradeInfoData를 기반으로 동적 테스트 생성
    gradeInfoData.forEach((grade) => {
      test(`${grade.label} 등급은 올바른 배지 색상을 적용한다`, () => {
        render(<ActivityBadge activityLevel={grade.label} />);

        const badge = screen.getByText(grade.label);
        const colorClasses = grade.badgeColor.split(" ");

        colorClasses.forEach((colorClass) => {
          expect(badge).toHaveClass(colorClass);
        });
      });
    });
  });

  describe("기본값 처리", () => {
    test("활동 레벨이 전달되지 않으면 NEWBIE를 표시한다", () => {
      render(<ActivityBadge />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });

    test("잘못된 활동 레벨이 전달되면 NEWBIE로 폴백한다", () => {
      render(<ActivityBadge activityLevel="INVALID_LEVEL" />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });

    test("빈 문자열이 전달되면 NEWBIE로 폴백한다", () => {
      render(<ActivityBadge activityLevel="" />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });

    test("undefined가 전달되면 NEWBIE를 표시한다", () => {
      render(<ActivityBadge activityLevel={undefined} />);

      expect(screen.getByText("NEWBIE")).toBeInTheDocument();
    });
  });

  describe("커스텀 스타일", () => {
    test("추가 className이 적용된다", () => {
      render(<ActivityBadge activityLevel="EXPERT" className="custom-class" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toHaveClass("custom-class");
    });

    test("기본 스타일과 커스텀 스타일이 함께 적용된다", () => {
      render(
        <ActivityBadge activityLevel="ACTIVE" className="ml-2 shadow-lg" />,
      );

      const badge = screen.getByText("ACTIVE");
      // 기본 스타일
      expect(badge).toHaveClass("inline-flex", "rounded-full");
      // 커스텀 스타일
      expect(badge).toHaveClass("ml-2", "shadow-lg");
    });

    test("빈 className이 전달되어도 정상 작동한다", () => {
      render(<ActivityBadge activityLevel="EXPERT" className="" />);

      const badge = screen.getByText("EXPERT");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    test("활동 등급에 대한 툴팁(title)이 제공된다", () => {
      render(<ActivityBadge activityLevel="ACTIVE" />);

      expect(screen.getByTitle("활동 등급: ACTIVE")).toBeInTheDocument();
    });

    test("기본값일 때도 툴팁이 올바르게 설정된다", () => {
      render(<ActivityBadge />);

      expect(screen.getByTitle("활동 등급: NEWBIE")).toBeInTheDocument();
    });

    // 모든 등급에 대한 툴팁 검증
    gradeInfoData.forEach((grade) => {
      test(`${grade.label} 등급의 툴팁이 올바르게 설정된다`, () => {
        render(<ActivityBadge activityLevel={grade.label} />);

        expect(
          screen.getByTitle(`활동 등급: ${grade.label}`),
        ).toBeInTheDocument();
      });
    });
  });

  describe("중앙화된 데이터 시스템 통합", () => {
    test("getActivityLevelInfo 함수를 통해 등급 정보를 가져온다", () => {
      render(<ActivityBadge activityLevel="EXPERT" />);

      // gradeInfoData에 정의된 EXPERT 정보가 반영되었는지 확인
      const expertGrade = gradeInfoData.find((g) => g.label === "EXPERT");
      const badge = screen.getByText("EXPERT");

      expect(expertGrade).toBeDefined();
      const colorClasses = expertGrade!.badgeColor.split(" ");
      colorClasses.forEach((colorClass) => {
        expect(badge).toHaveClass(colorClass);
      });
    });

    test("잘못된 등급에 대해 안전하게 NEWBIE로 폴백한다", () => {
      render(<ActivityBadge activityLevel="UNKNOWN" />);

      const newbieGrade = gradeInfoData.find((g) => g.label === "NEWBIE");
      const badge = screen.getByText("NEWBIE");

      expect(newbieGrade).toBeDefined();
      const colorClasses = newbieGrade!.badgeColor.split(" ");
      colorClasses.forEach((colorClass) => {
        expect(badge).toHaveClass(colorClass);
      });
    });

    test("gradeInfoData의 모든 등급이 올바르게 렌더링된다", () => {
      gradeInfoData.forEach((grade) => {
        const { unmount } = render(
          <ActivityBadge activityLevel={grade.label} />,
        );

        const badge = screen.getByText(grade.label);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute("title", `활동 등급: ${grade.label}`);

        const colorClasses = grade.badgeColor.split(" ");
        colorClasses.forEach((colorClass) => {
          expect(badge).toHaveClass(colorClass);
        });

        unmount();
      });
    });
  });
});
