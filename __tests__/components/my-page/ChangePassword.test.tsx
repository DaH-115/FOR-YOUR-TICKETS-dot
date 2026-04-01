import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAlert } from "store/context/alertContext";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { isAuth } from "firebase-config";
import ChangePassword from "app/my-page/components/ChangePassword";

// Mock modules
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}));

jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));

jest.mock("store/redux-toolkit/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("firebase-config", () => ({
  isAuth: {
    currentUser: null,
  },
}));

jest.mock("store/redux-toolkit/slice/userSlice", () => ({
  selectUser: jest.fn(),
}));

jest.mock("app/utils/firebaseError", () => ({
  firebaseErrorHandler: jest.fn((error) => {
    if (error && error.code === "auth/wrong-password") {
      return {
        title: "비밀번호 오류",
        message: "현재 비밀번호가 올바르지 않습니다.",
      };
    }
    return {
      title: "오류",
      message: "비밀번호 변경에 실패했습니다.",
    };
  }),
}));

jest.mock("app/components/ui/forms/InputField", () => {
  return function MockInputField({
    id,
    label,
    type,
    placeholder,
    register,
    error,
    touched,
    inlineError,
    disabled,
  }: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    register: (name: string, options?: { onChange?: (e: unknown) => void }) => {
      name: string;
      onChange: (e: unknown) => void;
      onBlur: () => void;
      ref: () => void;
    };
    error?: string;
    touched: boolean;
    inlineError?: string;
    disabled: boolean;
  }) {
    const displayError =
      (error && touched ? error : undefined) ?? inlineError;
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(id)}
          data-testid={id}
        />
        {displayError && (
          <span data-testid={`${id}-error`}>{displayError}</span>
        )}
      </div>
    );
  };
});

describe("ChangePassword", () => {
  const mockPush = jest.fn();
  const mockShowErrorHandler = jest.fn();
  const mockShowSuccessHandler = jest.fn();

  const defaultUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "테스트 사용자",
  };

  const defaultCurrentUser = {
    getIdToken: jest.fn().mockResolvedValue("mock-token"),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAlert as jest.Mock).mockReturnValue({
      showErrorHandler: mockShowErrorHandler,
      showSuccessHandler: mockShowSuccessHandler,
    });

    (useAppSelector as jest.Mock).mockReturnValue(defaultUser);
    Object.defineProperty(isAuth, "currentUser", {
      value: defaultCurrentUser,
      writable: true,
    });
  });

  test("컴포넌트가 정상적으로 렌더링된다", () => {
    render(<ChangePassword />);
    expect(
      screen.getByRole("heading", { name: "비밀번호 변경" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("현재 비밀번호")).toBeInTheDocument();
    expect(screen.getByLabelText("새로운 비밀번호")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "비밀번호 확인" }),
    ).toBeInTheDocument();
  });

  test("비밀번호 확인 버튼 클릭 시 핸들러가 호출된다", async () => {
    (EmailAuthProvider.credential as jest.Mock).mockReturnValue({
      user: "mock-user",
    });
    (reauthenticateWithCredential as jest.Mock).mockResolvedValue(undefined);

    render(<ChangePassword />);
    const currentPasswordInput = screen.getByTestId("currentPassword");
    const confirmButton = screen.getByRole("button", { name: "비밀번호 확인" });

    await act(async () => {
      // fireEvent로 인한 비동기 상태 업데이트를 안전하게 처리하기 위해 await로 감쌈
      await fireEvent.change(currentPasswordInput, {
        target: { value: "currentPassword123!" },
      });
      await fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
        "test@example.com",
        "currentPassword123!",
      );
      expect(reauthenticateWithCredential).toHaveBeenCalled();
      // 재인증 성공은 화면의 "확인 완료"로 피드백, 성공 토스트는 사용하지 않음
      expect(mockShowSuccessHandler).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "비밀번호 확인 완료" }),
      ).toBeInTheDocument();
    });
  });

  test("현재 비밀번호가 틀리면 인라인 오류를 보여준다", async () => {
    (EmailAuthProvider.credential as jest.Mock).mockReturnValue({});
    (reauthenticateWithCredential as jest.Mock).mockRejectedValue({
      code: "auth/wrong-password",
    });

    render(<ChangePassword />);

    await act(async () => {
      await fireEvent.change(screen.getByTestId("currentPassword"), {
        target: { value: "wrongPassword1!" },
      });
      await fireEvent.click(
        screen.getByRole("button", { name: "비밀번호 확인" }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("currentPassword-error")).toHaveTextContent(
        "현재 비밀번호가 올바르지 않습니다.",
      );
    });
  });
});
