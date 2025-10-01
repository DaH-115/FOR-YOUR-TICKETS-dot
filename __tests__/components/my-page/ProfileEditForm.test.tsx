import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAlert } from "store/context/alertContext";
import { useAppSelector, useAppDispatch } from "store/redux-toolkit/hooks";
import { isAuth } from "firebase-config";
import ProfileEditForm from "app/my-page/edit/ProfileEditForm";

// Mock modules
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("store/context/alertContext", () => ({
  useAlert: jest.fn(),
}));

jest.mock("store/redux-toolkit/hooks", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock("firebase-config", () => ({
  isAuth: {
    currentUser: null,
  },
}));

jest.mock("store/redux-toolkit/slice/userSlice", () => ({
  updateUserProfile: jest.fn(),
  selectUser: jest.fn(),
}));

jest.mock("app/my-page/components/ChangePassword", () => {
  return function MockChangePassword() {
    return <div data-testid="change-password">비밀번호 변경 컴포넌트</div>;
  };
});

describe("ProfileEditForm", () => {
  const mockPush = jest.fn();
  const mockShowErrorHandler = jest.fn();
  const mockShowSuccessHandler = jest.fn();
  const mockDispatch = jest.fn();

  const defaultUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "테스트 사용자",
    biography: "테스트 바이오",
    provider: "email",
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
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    Object.defineProperty(isAuth, "currentUser", {
      value: defaultCurrentUser,
      writable: true,
    });
  });

  test("컴포넌트가 정상적으로 렌더링된다", () => {
    render(<ProfileEditForm />);

    expect(screen.getByText("프로필 편집")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
    expect(screen.getByText("프로필 사진")).toBeInTheDocument();
    expect(screen.getByText("기본 정보")).toBeInTheDocument();
    expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
    expect(screen.getByLabelText("소개")).toBeInTheDocument();
  });

  test("이메일 제공자인 경우 비밀번호 변경 섹션이 표시된다", () => {
    render(<ProfileEditForm />);

    expect(screen.getByTestId("change-password")).toBeInTheDocument();
  });

  test("소셜 로그인 사용자의 경우 비밀번호 변경 섹션이 표시되지 않는다", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      ...defaultUser,
      provider: "google",
    });

    render(<ProfileEditForm />);

    expect(screen.queryByTestId("change-password")).not.toBeInTheDocument();
  });

  test("로그인하지 않은 사용자는 로그인 페이지로 리다이렉트된다", () => {
    (useAppSelector as jest.Mock).mockReturnValue(null);
    Object.defineProperty(isAuth, "currentUser", {
      value: null,
      writable: true,
    });

    render(<ProfileEditForm />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  test("뒤로가기 버튼을 클릭하면 마이페이지로 이동한다", () => {
    render(<ProfileEditForm />);

    // 첫 번째 버튼 (뒤로가기 아이콘이 있는 버튼)
    const buttons = screen.getAllByRole("button");
    const backButton = buttons[0]; // 첫 번째 버튼이 뒤로가기 버튼
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/my-page");
  });

  test("완료 버튼이 초기에는 비활성화되어 있다", () => {
    render(<ProfileEditForm />);

    const submitButton = screen.getByText("완료");
    expect(submitButton).toBeDisabled();
  });
});
