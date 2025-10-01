import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
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
    disabled,
  }: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    register: (name: string) => {
      name: string;
      onChange: () => void;
      onBlur: () => void;
      ref: () => void;
    };
    error?: string;
    touched: boolean;
    disabled: boolean;
  }) {
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
        {error && touched && <span data-testid={`${id}-error`}>{error}</span>}
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
    expect(
      screen.getByRole("button", { name: "비밀번호 변경" }),
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
      expect(mockShowSuccessHandler).toHaveBeenCalled();
    });
  });

  test("비밀번호 변경 버튼 클릭 시 핸들러가 호출된다", async () => {
    (updatePassword as jest.Mock).mockResolvedValue(undefined);

    render(<ChangePassword />);
    const newPasswordInput = screen.getByTestId("newPassword");
    const changeButton = screen.getByRole("button", { name: "비밀번호 변경" });

    await act(async () => {
      // fireEvent로 인한 비동기 상태 업데이트를 안전하게 처리하기 위해 await로 감쌈
      await fireEvent.change(newPasswordInput, {
        target: { value: "newPassword123!" },
      });
      await fireEvent.click(changeButton);
    });

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith(
        defaultCurrentUser,
        "newPassword123!",
      );
      expect(mockShowSuccessHandler).toHaveBeenCalled();
    });
  });

  test("비밀번호 변경 실패 시 에러가 표시된다", async () => {
    (updatePassword as jest.Mock).mockRejectedValue(
      new Error("비밀번호 변경 실패"),
    );

    render(<ChangePassword />);
    const newPasswordInput = screen.getByTestId("newPassword");
    const changeButton = screen.getByRole("button", { name: "비밀번호 변경" });

    await act(async () => {
      // fireEvent로 인한 비동기 상태 업데이트를 안전하게 처리하기 위해 await로 감쌈
      await fireEvent.change(newPasswordInput, {
        target: { value: "newPassword123!" },
      });
      await fireEvent.click(changeButton);
    });

    await waitFor(() => {
      expect(mockShowErrorHandler).toHaveBeenCalled();
    });
  });
});
