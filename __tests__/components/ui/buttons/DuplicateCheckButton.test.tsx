import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DuplicateCheckButton from "app/components/ui/buttons/DuplicateCheckButton";

describe("DuplicateCheckButton 컴포넌트", () => {
  const mockOnClick = jest.fn();

  const defaultProps = {
    onClick: mockOnClick,
    disabled: false,
    isChecking: false,
  };

  const renderButton = (props = {}) => {
    return render(<DuplicateCheckButton {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("기본 렌더링", () => {
    test("기본 상태에서 올바르게 렌더링되어야 한다", () => {
      renderButton();

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("중복 확인");
      expect(button).not.toBeDisabled();
    });

    test("로딩 상태일 때 올바르게 렌더링되어야 한다", () => {
      renderButton({ isChecking: true });

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("확인 중...");
    });

    test("비활성화 상태일 때 올바르게 렌더링되어야 한다", () => {
      renderButton({ disabled: true });

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("접근성", () => {
    test("aria-label이 올바르게 적용되어야 한다", () => {
      renderButton({ "aria-label": "닉네임 중복 확인" });

      const button = screen.getByRole("button", { name: "닉네임 중복 확인" });
      expect(button).toBeInTheDocument();
    });

    test("aria-describedby가 올바르게 적용되어야 한다", () => {
      renderButton({ "aria-describedby": "description-id" });

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "description-id");
    });

    test("키보드로 접근 가능해야 한다", async () => {
      const user = userEvent.setup();
      renderButton();

      const button = screen.getByRole("button");

      // Tab으로 포커스 이동
      await user.tab();
      expect(button).toHaveFocus();

      // Enter로 클릭
      await user.keyboard("{Enter}");
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("상호작용", () => {
    test("클릭 시 onClick 핸들러가 호출되어야 한다", async () => {
      const user = userEvent.setup();
      renderButton();

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("비활성화 상태일 때 클릭되지 않아야 한다", async () => {
      const user = userEvent.setup();
      renderButton({ disabled: true });

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("스타일링", () => {
    test("커스텀 className이 적용되어야 한다", () => {
      renderButton({ className: "custom-class" });

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    test("비활성화 상태일 때 적절한 스타일이 적용되어야 한다", () => {
      renderButton({ disabled: true });

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "cursor-not-allowed",
        "bg-gray-200",
        "text-gray-400",
      );
    });

    test("활성화 상태일 때 적절한 스타일이 적용되어야 한다", () => {
      renderButton();

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-600", "text-white");
    });
  });

  describe("텍스트 변경", () => {
    test("기본 상태에서는 '중복 확인' 텍스트를 표시해야 한다", () => {
      renderButton();

      expect(screen.getByText("중복 확인")).toBeInTheDocument();
    });

    test("로딩 상태에서는 '확인 중...' 텍스트를 표시해야 한다", () => {
      renderButton({ isChecking: true });

      expect(screen.getByText("확인 중...")).toBeInTheDocument();
    });
  });

  describe("props 조합 테스트", () => {
    test("disabled=true, isChecking=true 상태가 올바르게 작동해야 한다", () => {
      renderButton({
        disabled: true,
        isChecking: true,
        "aria-label": "테스트 버튼",
      });

      const button = screen.getByRole("button", { name: "테스트 버튼" });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("확인 중...");
      expect(button).toHaveClass("cursor-not-allowed");
    });

    test("모든 선택적 props가 함께 작동해야 한다", () => {
      renderButton({
        className: "test-class",
        "aria-label": "완전한 테스트",
        "aria-describedby": "test-description",
      });

      const button = screen.getByRole("button", { name: "완전한 테스트" });
      expect(button).toHaveClass("test-class");
      expect(button).toHaveAttribute("aria-describedby", "test-description");
      expect(button).toHaveTextContent("중복 확인");
    });
  });
});
