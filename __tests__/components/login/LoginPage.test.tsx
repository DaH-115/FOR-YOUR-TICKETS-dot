import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "app/login/components/LoginPage";
import { useAlert } from "store/context/alertContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// Mock dependencies
jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 100)),
  ),
  signInWithPopup: jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 100)),
  ),
  GoogleAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
}));
jest.mock("firebase-config", () => ({
  isAuth: jest.fn(),
}));

const mockSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
  >;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>;

const mockShowErrorHandler = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

// 테스트 헬퍼 함수들
const setupMockAuth = () => {
  (useAlert as jest.Mock).mockReturnValue({
    showErrorHandler: mockShowErrorHandler,
  });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
    push: mockPush,
  });
};

const setupMockFirebaseSuccess = () => {
  mockSignInWithEmailAndPassword.mockResolvedValue({
    user: { uid: "test-uid" },
  } as never);
  mockSignInWithPopup.mockResolvedValue({
    user: { uid: "test-uid" },
  } as never);
};

beforeEach(() => {
  jest.clearAllMocks();
  // 기본 Mock 설정
  setupMockAuth();
  setupMockFirebaseSuccess();
});

describe("LoginPage 컴포넌트", () => {
  describe("폼 기능", () => {
    test("유효한 입력으로 폼을 제출할 수 있어야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), "test@example.com");
      await user.type(screen.getByLabelText("비밀번호"), "password123");
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "test@example.com",
          "password123",
        );
      });
    });

    test("유효하지 않은 이메일 형식에 대해 오류를 표시해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("올바른 이메일 형식이 아닙니다."),
        ).toBeInTheDocument();
      });
    });

    test("짧은 비밀번호에 대해 오류를 표시해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("비밀번호"), "123");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("비밀번호는 최소 8자 이상이어야 합니다."),
        ).toBeInTheDocument();
      });
    });

    test("로그인 상태 유지 체크박스가 작동해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const checkbox = screen.getByLabelText("로그인 상태 유지");
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test("로그인 성공 시 리다이렉트가 처리되어야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), "test@example.com");
      await user.type(screen.getByLabelText("비밀번호"), "password123");
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    test("로그인 실패 시 에러 메시지가 표시되어야 한다", async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), "test@example.com");
      await user.type(screen.getByLabelText("비밀번호"), "password123");
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockShowErrorHandler).toHaveBeenCalledWith(
          "에러",
          "Invalid credentials",
        );
      });
    });
  });

  describe("소셜 로그인", () => {
    test("소셜 로그인 버튼들이 존재해야 한다", () => {
      render(<LoginPage />);

      expect(
        screen.getByRole("button", { name: "Google로 계속하기 로그인" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "GitHub로 계속하기 로그인" }),
      ).toBeInTheDocument();
    });

    test("소셜 로그인 버튼이 클릭 가능해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(
        screen.getByRole("button", { name: "Google로 계속하기 로그인" }),
      );
      await user.click(
        screen.getByRole("button", { name: "GitHub로 계속하기 로그인" }),
      );

      expect(mockSignInWithPopup).toHaveBeenCalledTimes(2);
    });

    test("소셜 로그인 실패 시 에러 메시지가 표시되어야 한다", async () => {
      mockSignInWithPopup.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<LoginPage />);
      await user.click(
        screen.getByRole("button", { name: "Google로 계속하기 로그인" }),
      );

      await waitFor(() => {
        expect(mockShowErrorHandler).toHaveBeenCalledWith(
          "에러",
          "Network error",
        );
      });
    });
  });

  describe("회원가입 링크", () => {
    test("회원가입 버튼이 존재하고 올바른 링크를 가져야 한다", () => {
      render(<LoginPage />);

      const signupButton = screen.getByRole("button", { name: "회원가입" });
      const signupLink = screen.getByRole("link");

      expect(signupButton).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/sign-up");
    });
  });
});
