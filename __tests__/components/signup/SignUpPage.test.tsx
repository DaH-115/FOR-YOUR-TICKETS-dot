import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SignUpPage from "app/sign-up/SignUpPage";
import { useAlert } from "store/context/alertContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";

// Mock dependencies
jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("app/my-page/hooks/useDuplicateCheckState", () => ({
  useDuplicateCheckState: jest.fn(),
}));
jest.mock("firebase-config", () => ({
  isAuth: jest.fn(),
}));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

const mockUseDuplicateCheckState = jest.requireMock(
  "app/my-page/hooks/useDuplicateCheckState",
).useDuplicateCheckState;
const mockSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
  >;

const mockShowErrorHandler = jest.fn();
const mockShowSuccessHandler = jest.fn();
const mockReplace = jest.fn();
const mockFetch = jest.fn();

// 테스트 데이터
const VALID_USER_DATA = {
  name: "테스트사용자",
  nickname: "testuser",
  email: "test@example.com",
  password: "password123!",
  confirmPassword: "password123!",
};

beforeEach(() => {
  jest.clearAllMocks();

  // 기본 mock 설정
  (useAlert as jest.Mock).mockReturnValue({
    showErrorHandler: mockShowErrorHandler,
    showSuccessHandler: mockShowSuccessHandler,
  });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
  });

  // 중복 확인 상태 기본값 (미완료 상태)
  mockUseDuplicateCheckState.mockReturnValue({
    check: jest.fn(),
    isChecking: false,
    isChecked: false,
    isAvailable: null,
    message: null,
  });

  // API 호출 기본값
  mockSignInWithEmailAndPassword.mockResolvedValue({
    user: { uid: "test-uid" },
  } as never);
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  } as Response);
  global.fetch = mockFetch;
});

describe("SignUpPage 컴포넌트", () => {
  describe("기본 렌더링 및 상태", () => {
    test("초기 상태에서 회원가입 버튼이 비활성화되어야 한다", () => {
      render(<SignUpPage />);

      const signupButton = screen.getByRole("button", { name: /회원가입/ });
      expect(signupButton).toBeDisabled();
      expect(
        screen.getByText("닉네임과 이메일 중복 확인을 완료해주세요."),
      ).toBeInTheDocument();
    });

    test("입력 필드가 비어있을 때 중복 확인 버튼들이 비활성화되어야 한다", () => {
      render(<SignUpPage />);

      const checkButtons = screen.getAllByText("중복 확인");
      expect(checkButtons[0]).toBeDisabled(); // 닉네임 버튼
      expect(checkButtons[1]).toBeDisabled(); // 이메일 버튼
    });
  });

  describe("중복 확인 기능", () => {
    test("중복 확인 버튼 클릭 시 check 함수가 호출되어야 한다", async () => {
      const mockCheck = jest.fn();
      mockUseDuplicateCheckState.mockReturnValue({
        check: mockCheck,
        isChecking: false,
        isChecked: false,
        isAvailable: null,
        message: null,
      });

      const user = userEvent.setup();
      render(<SignUpPage />);

      const nicknameInput = screen.getByLabelText("닉네임");
      const checkButtons = screen.getAllByText("중복 확인");

      await user.type(nicknameInput, "testnickname");
      await user.click(checkButtons[0]);

      expect(mockCheck).toHaveBeenCalled();
    });

    test("중복 확인이 완료되면 회원가입 버튼이 활성화되어야 한다", () => {
      // 중복 확인 완료 상태로 설정
      mockUseDuplicateCheckState.mockReturnValue({
        check: jest.fn(),
        isChecking: false,
        isChecked: true,
        isAvailable: true,
        message: "사용 가능합니다.",
      });

      render(<SignUpPage />);

      const signupButton = screen.getByRole("button", { name: /회원가입/ });
      expect(signupButton).not.toBeDisabled();
      expect(
        screen.queryByText("닉네임과 이메일 중복 확인을 완료해주세요."),
      ).not.toBeInTheDocument();
    });
  });

  describe("폼 유효성 검증", () => {
    test("유효하지 않은 입력값에 대해 오류 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      // 이름이 너무 짧은 경우
      const nameInput = screen.getByLabelText("이름");
      await user.type(nameInput, "a");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("이름은 최소 2글자 이상이어야 합니다."),
        ).toBeInTheDocument();
      });

      // 이메일 형식이 잘못된 경우
      const emailInput = screen.getByLabelText("이메일");
      await user.clear(emailInput);
      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("올바른 이메일 형식이 아닙니다."),
        ).toBeInTheDocument();
      });

      // 비밀번호가 너무 짧은 경우
      const passwordInput = screen.getByLabelText("비밀번호");
      await user.type(passwordInput, "123");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("비밀번호는 최소 8자 이상이어야 합니다."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("회원가입 처리", () => {
    test("유효한 정보로 회원가입이 성공해야 한다", async () => {
      const user = userEvent.setup();

      // 중복 확인 완료 상태로 설정
      mockUseDuplicateCheckState.mockReturnValue({
        check: jest.fn(),
        isChecking: false,
        isChecked: true,
        isAvailable: true,
        message: "사용 가능합니다.",
      });

      render(<SignUpPage />);

      // 모든 필드 입력
      await user.type(screen.getByLabelText("이름"), VALID_USER_DATA.name);
      await user.type(
        screen.getByLabelText("닉네임"),
        VALID_USER_DATA.nickname,
      );
      await user.type(screen.getByLabelText("이메일"), VALID_USER_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_USER_DATA.password,
      );
      await user.type(
        screen.getByLabelText("비밀번호 확인"),
        VALID_USER_DATA.confirmPassword,
      );

      // 회원가입 버튼 클릭
      await user.click(screen.getByRole("button", { name: /회원가입/ }));

      await waitFor(() => {
        // API 호출 확인
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/auth/signup",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              displayName: VALID_USER_DATA.nickname,
              email: VALID_USER_DATA.email,
              password: VALID_USER_DATA.password,
            }),
          }),
        );

        // 자동 로그인 확인
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          VALID_USER_DATA.email,
          VALID_USER_DATA.password,
        );

        // 성공 메시지 확인
        expect(mockShowSuccessHandler).toHaveBeenCalledWith(
          "회원가입 완료",
          "환영합니다!",
          expect.any(Function),
        );
      });
    });

    test("회원가입 실패 시 에러가 표시되어야 한다", async () => {
      const user = userEvent.setup();

      // 중복 확인 완료 상태로 설정
      mockUseDuplicateCheckState.mockReturnValue({
        check: jest.fn(),
        isChecking: false,
        isChecked: true,
        isAvailable: true,
        message: "사용 가능합니다.",
      });

      // API 실패 mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "이미 사용 중인 이메일입니다." }),
      } as Response);

      render(<SignUpPage />);

      await user.type(screen.getByLabelText("이름"), VALID_USER_DATA.name);
      await user.type(
        screen.getByLabelText("닉네임"),
        VALID_USER_DATA.nickname,
      );
      await user.type(screen.getByLabelText("이메일"), VALID_USER_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_USER_DATA.password,
      );
      await user.type(
        screen.getByLabelText("비밀번호 확인"),
        VALID_USER_DATA.confirmPassword,
      );

      await user.click(screen.getByRole("button", { name: /회원가입/ }));

      await waitFor(() => {
        expect(mockShowErrorHandler).toHaveBeenCalledWith(
          expect.any(String),
          "이미 사용 중인 이메일입니다.",
        );
      });
    });
  });

  describe("로딩 상태", () => {
    test("회원가입 중에는 버튼과 입력 필드가 비활성화되어야 한다", async () => {
      const user = userEvent.setup();

      // 중복 확인 완료 상태로 설정
      mockUseDuplicateCheckState.mockReturnValue({
        check: jest.fn(),
        isChecking: false,
        isChecked: true,
        isAvailable: true,
        message: "사용 가능합니다.",
      });

      // API 호출이 pending 상태로 유지
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<SignUpPage />);

      await user.type(screen.getByLabelText("이름"), VALID_USER_DATA.name);
      await user.type(
        screen.getByLabelText("닉네임"),
        VALID_USER_DATA.nickname,
      );
      await user.type(screen.getByLabelText("이메일"), VALID_USER_DATA.email);
      await user.type(
        screen.getByLabelText("비밀번호"),
        VALID_USER_DATA.password,
      );
      await user.type(
        screen.getByLabelText("비밀번호 확인"),
        VALID_USER_DATA.confirmPassword,
      );

      await user.click(screen.getByRole("button", { name: /회원가입/ }));

      await waitFor(() => {
        // 버튼 상태 확인
        const loadingButton = screen.getByRole("button", { name: /가입 중/ });
        expect(loadingButton).toBeDisabled();

        // 입력 필드 비활성화 확인
        expect(screen.getByLabelText("이름")).toBeDisabled();
        expect(screen.getByLabelText("닉네임")).toBeDisabled();
        expect(screen.getByLabelText("이메일")).toBeDisabled();
        expect(screen.getByLabelText("비밀번호")).toBeDisabled();
        expect(screen.getByLabelText("비밀번호 확인")).toBeDisabled();
      });
    });
  });
});
