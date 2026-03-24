import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "@/login/components/LoginPage";
import { useAlert } from "store/context/alertContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import * as authPersistence from "@/utils/authPersistence";
import { getIdToken } from "@/utils/getIdToken/getIdToken";
import { useAppSelector } from "store/redux-toolkit/hooks";

// Mock dependencies
jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithPopup: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: "local",
  browserSessionPersistence: "session",
}));
jest.mock("firebase-config", () => ({
  isAuth: jest.fn(),
}));
jest.mock("@/utils/authPersistence", () => ({
  setRememberMe: jest.fn(() => Promise.resolve()),
  getCurrentPersistence: jest.fn(() => "local"),
  clearAuthPersistence: jest.fn(),
}));
jest.mock("@/utils/getIdToken/getIdToken", () => ({
  getIdToken: jest.fn(() => Promise.resolve("mock-id-token")),
}));
jest.mock("store/redux-toolkit/hooks", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
  >;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>;
const mockGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;

const mockShowErrorHandler = jest.fn();
const mockShowSuccessHandler = jest.fn();
const mockHideErrorHandler = jest.fn();
const mockHideSuccessHandler = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockSetRememberMe = jest.fn();
const mockFetch = jest.fn();

// 테스트 데이터
const VALID_LOGIN_DATA = {
  email: "test@example.com",
  password: "password123",
};

beforeEach(() => {
  jest.clearAllMocks();

  // 기본 mock 설정
  (useAlert as jest.Mock).mockReturnValue({
    showErrorHandler: mockShowErrorHandler,
    showSuccessHandler: mockShowSuccessHandler,
    hideErrorHandler: mockHideErrorHandler,
    hideSuccessHandler: mockHideSuccessHandler,
  });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
    push: mockPush,
  });

  // Firebase mock 설정
  mockSignInWithEmailAndPassword.mockResolvedValue({
    user: { uid: "test-uid" },
  } as never);
  mockSignInWithPopup.mockResolvedValue({
    user: { uid: "test-uid" },
  } as never);

  // authPersistence mock 설정
  jest
    .mocked(authPersistence.setRememberMe)
    .mockImplementation(mockSetRememberMe);

  // 기타 mock 설정
  mockUseAppSelector.mockReturnValue(null); // 로그인되지 않은 상태
  mockGetIdToken.mockResolvedValue("mock-id-token");
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  } as Response);
  global.fetch = mockFetch;
});

describe("LoginPage 컴포넌트", () => {
  describe("기본 로그인 기능", () => {
    test("유효한 정보로 로그인이 성공해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), VALID_LOGIN_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_LOGIN_DATA.password,
      );
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          VALID_LOGIN_DATA.email,
          VALID_LOGIN_DATA.password,
        );
        expect(mockSetRememberMe).toHaveBeenCalledWith(false);
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    test("로그인 상태 유지 체크 시 setRememberMe가 true로 호출되어야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByLabelText("로그인 상태 유지"));
      await user.type(screen.getByLabelText("이메일"), VALID_LOGIN_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_LOGIN_DATA.password,
      );
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockSetRememberMe).toHaveBeenCalledWith(true);
      });
    });

    test("로그인 실패 시 에러 메시지가 표시되어야 한다", async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), VALID_LOGIN_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_LOGIN_DATA.password,
      );
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockShowErrorHandler).toHaveBeenCalledWith(
          "에러",
          "Invalid credentials",
        );
      });
    });
  });

  describe("유효성 검증", () => {
    test("유효하지 않은 입력값에 대해 오류 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      // 잘못된 이메일 형식
      await user.type(screen.getByLabelText("이메일"), "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("올바른 이메일 형식이 아닙니다."),
        ).toBeInTheDocument();
      });

      // 짧은 비밀번호
      const passwordInput = screen.getByLabelText("비밀번호");
      await user.clear(passwordInput);
      await user.type(passwordInput, "123");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("비밀번호는 최소 8자 이상이어야 합니다."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("소셜 로그인", () => {
    test("소셜 로그인이 정상 작동해야 한다", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      // Google 로그인 버튼 클릭
      await user.click(
        screen.getByRole("button", { name: /Google로 계속하기/i }),
      );

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockSetRememberMe).toHaveBeenCalledWith(false);
        expect(mockGetIdToken).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/users/me/profile",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer mock-id-token",
            }),
          }),
        );
        expect(mockReplace).toHaveBeenCalledWith("/");
      });
    });

    test("소셜 로그인 실패 시 에러 메시지가 표시되어야 한다", async () => {
      mockSignInWithPopup.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(
        screen.getByRole("button", { name: /Google로 계속하기/i }),
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

  describe("이미 로그인된 사용자 처리", () => {
    test("이미 로그인된 사용자는 홈으로 리다이렉트되어야 한다", async () => {
      mockUseAppSelector.mockReturnValue({
        uid: "test-uid",
        email: "test@example.com",
      });

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("로딩 상태", () => {
    test("로그인 중에는 버튼과 입력 필드가 비활성화되어야 한다", async () => {
      // 로그인이 완료되지 않도록 pending 상태 유지
      mockSignInWithEmailAndPassword.mockImplementation(
        () => new Promise(() => {}),
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("이메일"), VALID_LOGIN_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_LOGIN_DATA.password,
      );
      await user.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        // 버튼 상태 확인
        const loadingButton = screen.getByRole("button", {
          name: "로그인 중...",
        });
        expect(loadingButton).toBeDisabled();

        // 입력 필드 비활성화 확인
        expect(screen.getByLabelText("이메일")).toBeDisabled();
        expect(screen.getByLabelText("비밀번호")).toBeDisabled();
        expect(screen.getByLabelText("로그인 상태 유지")).toBeDisabled();
      });
    });
  });
});
