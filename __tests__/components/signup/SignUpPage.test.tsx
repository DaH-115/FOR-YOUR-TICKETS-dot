import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SignUpPage from "app/sign-up/SignUpPage";
import { useAlert } from "store/context/alertContext";
import { useRouter } from "next/navigation";

// Mock dependencies
jest.mock("app/utils/api", () => ({
  checkDuplicate: jest.fn(),
}));
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
  db: jest.fn(),
}));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

const mockUseDuplicateCheckState = jest.requireMock(
  "app/my-page/hooks/useDuplicateCheckState",
).useDuplicateCheckState;
const mockShowErrorHandler = jest.fn();
const mockShowSuccessHandler = jest.fn();
const mockReplace = jest.fn();

// 테스트 헬퍼 함수들
const setupMockDuplicateCheck = (state: {
  isChecked?: boolean;
  isAvailable?: boolean | null;
  message?: string | null;
}) => {
  mockUseDuplicateCheckState.mockReturnValue({
    check: jest.fn(),
    isChecking: false,
    isChecked: state.isChecked ?? false,
    isAvailable: state.isAvailable ?? null,
    message: state.message ?? null,
  });
};

const setupMockDuplicateCheckSequence = (
  nicknameState: {
    isChecked?: boolean;
    isAvailable?: boolean | null;
    message?: string | null;
  },
  emailState: {
    isChecked?: boolean;
    isAvailable?: boolean | null;
    message?: string | null;
  },
) => {
  // 첫 번째 호출(닉네임), 두 번째 호출(이메일) 순서로 설정
  mockUseDuplicateCheckState
    .mockReturnValueOnce({
      check: jest.fn(),
      isChecking: false,
      isChecked: nicknameState.isChecked ?? false,
      isAvailable: nicknameState.isAvailable ?? null,
      message: nicknameState.message ?? null,
    })
    .mockReturnValueOnce({
      check: jest.fn(),
      isChecking: false,
      isChecked: emailState.isChecked ?? false,
      isAvailable: emailState.isAvailable ?? null,
      message: emailState.message ?? null,
    });
};

const setupMockFetch = (response: { ok: boolean; data?: unknown }) => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: response.ok,
    json: async () => response.data ?? { success: true },
  });
};

beforeEach(() => {
  (useAlert as jest.Mock).mockReturnValue({
    showErrorHandler: mockShowErrorHandler,
    showSuccessHandler: mockShowSuccessHandler,
  });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
  });
  jest.clearAllMocks();
  (fetch as jest.Mock).mockClear();

  // 기본 상태 설정
  setupMockDuplicateCheck({ isChecked: false, isAvailable: null });
});

describe("SignUpPage 필수 동작 시나리오", () => {
  test("닉네임 중복 확인 버튼이 정상 동작해야 한다", async () => {
    const mockCheckFunction = jest.fn();
    mockUseDuplicateCheckState.mockReturnValue({
      check: mockCheckFunction,
      isChecking: false,
      isChecked: false,
      isAvailable: null,
      message: null,
    });

    const user = userEvent.setup();
    render(<SignUpPage />);
    const nicknameInput = screen.getByLabelText("닉네임");
    const checkButtons = screen.getAllByText("중복 확인");
    const checkButton = checkButtons[0];
    await user.type(nicknameInput, "testnickname");
    await user.click(checkButton);
    expect(mockCheckFunction).toHaveBeenCalled();
  });

  test("이메일 중복 확인이 성공적으로 작동해야 한다", async () => {
    const user = userEvent.setup();
    const mockCheckEmail = jest.fn().mockResolvedValue(undefined);

    mockUseDuplicateCheckState.mockReturnValue({
      check: mockCheckEmail,
      isChecking: false,
      isChecked: false,
      isAvailable: null,
      message: null,
    });

    render(<SignUpPage />);
    const emailInput = screen.getByLabelText("이메일");
    const checkButtons = screen.getAllByText("중복 확인");
    const checkButton = checkButtons[1];
    await user.type(emailInput, "test@example.com");
    await user.click(checkButton);
    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalled();
    });
  });

  test("닉네임/이메일이 비어있을 때 중복 확인 버튼이 비활성화되어야 한다", () => {
    render(<SignUpPage />);

    // 초기 상태에서 입력 필드들이 비어있는지 확인
    const nicknameInput = screen.getByLabelText("닉네임");
    const emailInput = screen.getByLabelText("이메일");

    expect(nicknameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");

    // 입력 필드가 비어있을 때 중복 확인 버튼들이 비활성화되어야 함
    const checkButtons = screen.getAllByText("중복 확인");
    expect(checkButtons[0]).toBeDisabled(); // 닉네임 버튼
    expect(checkButtons[1]).toBeDisabled(); // 이메일 버튼
  });

  test("닉네임/이메일을 입력하면 중복 확인 버튼이 활성화되어야 한다", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    const nicknameInput = screen.getByLabelText("닉네임");
    const emailInput = screen.getByLabelText("이메일");
    const checkButtons = screen.getAllByText("중복 확인");

    // 초기에는 버튼들이 비활성화되어 있음
    expect(checkButtons[0]).toBeDisabled();
    expect(checkButtons[1]).toBeDisabled();

    // 닉네임을 입력하면 닉네임 중복 확인 버튼이 활성화되어야 함
    await user.type(nicknameInput, "testnickname");
    expect(checkButtons[0]).not.toBeDisabled();
    expect(checkButtons[1]).toBeDisabled(); // 이메일은 여전히 비활성화

    // 이메일을 입력하면 이메일 중복 확인 버튼도 활성화되어야 함
    await user.type(emailInput, "test@example.com");
    expect(checkButtons[0]).not.toBeDisabled();
    expect(checkButtons[1]).not.toBeDisabled();
  });

  test("모든 조건이 충족되지 않으면 회원가입 버튼이 비활성화되어야 한다", () => {
    render(<SignUpPage />);
    const signupButton = screen.getByRole("button", { name: /회원가입/ });

    // 초기 상태에서 회원가입 버튼이 비활성화되어야 함
    expect(signupButton).toBeDisabled();

    // 중복 확인 미완료 메시지가 표시되어야 함
    expect(
      screen.getByText("닉네임과 이메일 중복 확인을 완료해주세요."),
    ).toBeInTheDocument();
  });

  test("닉네임과 이메일 중복 확인이 완료되면 회원가입 버튼이 활성화되어야 한다", () => {
    // 두 호출 모두 성공 상태로 설정
    setupMockDuplicateCheck({
      isChecked: true,
      isAvailable: true,
      message: "사용 가능합니다.",
    });

    render(<SignUpPage />);
    const signupButton = screen.getByRole("button", { name: /회원가입/ });

    // 모든 조건이 충족되면 회원가입 버튼이 활성화되어야 함
    expect(signupButton).not.toBeDisabled();

    // 중복 확인 미완료 메시지가 표시되지 않아야 함
    expect(
      screen.queryByText("닉네임과 이메일 중복 확인을 완료해주세요."),
    ).not.toBeInTheDocument();
  });

  test("닉네임만 중복 확인 완료되어도 회원가입 버튼이 비활성화되어야 한다", () => {
    // 닉네임은 성공, 이메일은 미완료 상태로 mock 설정
    setupMockDuplicateCheckSequence(
      {
        isChecked: true,
        isAvailable: true,
        message: "사용 가능합니다.",
      },
      {
        isChecked: false,
        isAvailable: null,
        message: null,
      },
    );

    render(<SignUpPage />);
    const signupButton = screen.getByRole("button", { name: /회원가입/ });

    // 이메일 중복 확인이 완료되지 않았으므로 버튼이 비활성화되어야 함
    expect(signupButton).toBeDisabled();
    expect(
      screen.getByText("닉네임과 이메일 중복 확인을 완료해주세요."),
    ).toBeInTheDocument();
  });

  test("닉네임 중복 체크 실패 시 에러 핸들러가 호출되어야 한다", () => {
    // 닉네임 중복 체크 실패 상황 시뮬레이션
    setupMockDuplicateCheck({
      isChecked: true,
      isAvailable: false,
      message: "네트워크 오류로 인해 중복 확인에 실패했습니다.",
    });

    render(<SignUpPage />);

    // useEffect가 실행되어 에러 핸들러가 호출되는지 확인
    expect(mockShowErrorHandler).toHaveBeenCalledWith(
      "실패",
      "네트워크 오류로 인해 중복 확인에 실패했습니다.",
    );
  });

  test("이메일 중복 체크 실패 시 에러 핸들러가 호출되어야 한다", () => {
    // 이메일 중복 체크 실패 상황 시뮬레이션
    setupMockDuplicateCheckSequence(
      {
        isChecked: false,
        isAvailable: null,
        message: null,
      },
      {
        isChecked: true,
        isAvailable: false,
        message: "서버 연결에 실패했습니다. 다시 시도해주세요.",
      },
    );

    render(<SignUpPage />);

    // 이메일 중복 체크 실패로 인한 에러 핸들러 호출 확인
    expect(mockShowErrorHandler).toHaveBeenCalledWith(
      "실패",
      "서버 연결에 실패했습니다. 다시 시도해주세요.",
    );
  });

  test("닉네임 중복 체크 성공 시 성공 핸들러가 호출되어야 한다", () => {
    // 닉네임 중복 체크 성공 상황 시뮬레이션
    setupMockDuplicateCheckSequence(
      {
        isChecked: true,
        isAvailable: true,
        message: "사용 가능한 닉네임입니다.",
      },
      {
        isChecked: false,
        isAvailable: null,
        message: null,
      },
    );

    render(<SignUpPage />);

    // useEffect가 실행되어 성공 핸들러가 호출되는지 확인
    expect(mockShowSuccessHandler).toHaveBeenCalledWith(
      "성공",
      "사용 가능한 닉네임입니다.",
    );
  });

  test("이메일 중복 체크 성공 시 성공 핸들러가 호출되어야 한다", () => {
    // 이메일 중복 체크 성공 상황 시뮬레이션
    setupMockDuplicateCheckSequence(
      {
        isChecked: false,
        isAvailable: null,
        message: null,
      },
      {
        isChecked: true,
        isAvailable: true,
        message: "사용 가능한 이메일입니다.",
      },
    );

    render(<SignUpPage />);

    // useEffect가 실행되어 성공 핸들러가 호출되는지 확인
    expect(mockShowSuccessHandler).toHaveBeenCalledWith(
      "성공",
      "사용 가능한 이메일입니다.",
    );
  });

  test("회원가입 성공 시 성공 메시지와 리다이렉트가 처리되어야 한다", async () => {
    const user = userEvent.setup();

    // 모든 중복 확인이 완료된 상태로 설정
    setupMockDuplicateCheck({
      isChecked: true,
      isAvailable: true,
      message: "사용 가능합니다.",
    });

    // fetch API 성공 응답 mock
    setupMockFetch({ ok: true });

    render(<SignUpPage />);

    // 모든 필드 입력
    const nameInput = screen.getByLabelText("이름");
    const nicknameInput = screen.getByLabelText("닉네임");
    const emailInput = screen.getByLabelText("이메일");
    const passwordInput = screen.getByLabelText("비밀번호");
    const confirmPasswordInput = screen.getByLabelText("비밀번호 확인");

    await user.type(nameInput, "테스트사용자");
    await user.type(nicknameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123!");
    await user.type(confirmPasswordInput, "password123!");

    // 회원가입 버튼 클릭
    const signupButton = screen.getByRole("button", { name: /회원가입/ });
    await user.click(signupButton);

    // 성공 메시지 표시 확인 (회원가입 완료 메시지)
    await waitFor(() => {
      const calls = mockShowSuccessHandler.mock.calls;
      const signupSuccessCall = calls.find(
        (call) => call[0] === "회원가입 완료",
      );
      expect(signupSuccessCall).toEqual([
        "회원가입 완료",
        "환영합니다!",
        expect.any(Function),
      ]);
    });

    // 성공 핸들러의 콜백 함수 실행 (리다이렉트)
    const calls = mockShowSuccessHandler.mock.calls;
    const signupSuccessCall = calls.find((call) => call[0] === "회원가입 완료");
    const successCallback = signupSuccessCall[2];
    successCallback();

    // 리다이렉트 확인
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
