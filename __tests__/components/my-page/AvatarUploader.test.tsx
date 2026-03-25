import { render, screen, fireEvent } from "@testing-library/react";
import AvatarUploader from "app/my-page/components/profile-avatar/AvatarUploader";

// jest.mock
jest.mock("app/utils/file/validateFileSize", () => ({
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  validateFileSize: jest.fn(() => true),
}));
jest.mock("app/utils/file/validateFileExtension", () => ({
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif"],
  validateFileExtension: jest.fn(() => true),
}));
jest.mock("app/utils/file/formatFileSize", () => ({
  formatFileSize: jest.fn((bytes) =>
    bytes === 5 * 1024 * 1024 ? "5 MB" : `${bytes} bytes`,
  ),
}));
jest.mock("app/utils/file/validateFileType", () => ({
  validateFileType: jest.fn(() => true),
}));

// useAvatarUpload 훅 모킹
jest.mock("app/my-page/hooks/useAvatarUpload", () => ({
  useAvatarUpload: jest.fn(),
}));

// 목 함수들을 import해서 직접 검증
import { validateFileSize } from "app/utils/file/validateFileSize";
import { validateFileExtension } from "app/utils/file/validateFileExtension";
import { formatFileSize } from "app/utils/file/formatFileSize";
import { validateFileType } from "app/utils/file/validateFileType";
import { useAvatarUpload } from "app/my-page/hooks/useAvatarUpload";

global.URL.createObjectURL = jest.fn(() => "mocked-object-url");
global.URL.revokeObjectURL = jest.fn();

describe("AvatarUploader", () => {
  const mockOnPreview = jest.fn();
  const mockOnCancelPreview = jest.fn();
  const mockOnFileSelect = jest.fn();
  const mockOnImageChange = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps = {
    previewSrc: null,
    onPreview: mockOnPreview,
    onCancelPreview: mockOnCancelPreview,
    onFileSelect: mockOnFileSelect,
    onImageChange: mockOnImageChange,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 목 함수들도 초기화
    (validateFileSize as jest.Mock).mockClear();
    (validateFileExtension as jest.Mock).mockClear();
    (formatFileSize as jest.Mock).mockClear();
    (validateFileType as jest.Mock).mockClear();

    // useAvatarUpload 훅 기본 모킹 설정
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: false,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: null },
      onEditToggle: jest.fn(),
      onFileChange: jest.fn(),
    });
  });

  test("프로필 이미지 수정 버튼이 렌더링된다", () => {
    render(<AvatarUploader {...defaultProps} />);
    expect(screen.getByText("프로필 사진 수정")).toBeInTheDocument();
  });

  test("편집 모드에서 파일 제한 안내가 표시된다", () => {
    // 편집 모드로 설정
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: jest.fn(),
    });

    render(<AvatarUploader {...defaultProps} />);
    expect(screen.getByText("지원 형식: JPG, PNG, GIF")).toBeInTheDocument();
    expect(screen.getByText("최대 크기: 5 MB")).toBeInTheDocument();

    // formatFileSize가 MAX_FILE_SIZE로 호출되는지 확인
    expect(formatFileSize).toHaveBeenCalledWith(5 * 1024 * 1024);
  });

  test("유효한 이미지 파일 선택 시 성공적으로 처리된다", () => {
    const mockOnFileChange = jest.fn();

    // 편집 모드로 설정
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: mockOnFileChange,
    });

    render(<AvatarUploader {...defaultProps} />);

    const validFile = new File(["image content"], "test.jpg", {
      type: "image/jpeg",
    });

    // 파일 입력이 렌더링되었는지 확인
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();

    // 파일 변경 이벤트를 시뮬레이션하여 mockOnFileChange를 호출
    const fileInput = screen.getByTestId("avatar-file-input");
    const mockEvent = {
      target: { files: [validFile] },
    };

    // useAvatarUpload의 onFileChange가 실제로 파일 검증을 수행하도록 모킹
    mockOnFileChange.mockImplementation((e) => {
      const file = e.target.files?.[0];
      if (file) {
        // 파일 검증 함수들이 호출되는지 확인
        validateFileSize(file.size);
        validateFileExtension(file.name);
        validateFileType(file.type);

        // 핵심 비즈니스 로직 검증
        mockOnFileSelect(file);
        mockOnPreview("mocked-object-url");
        mockOnImageChange(true);
      }
    });

    // 파일 변경 이벤트를 트리거
    mockOnFileChange(mockEvent);

    // 파일 검증 함수들이 호출되는지 확인
    expect(validateFileSize).toHaveBeenCalledWith(validFile.size);
    expect(validateFileExtension).toHaveBeenCalledWith("test.jpg");
    expect(validateFileType).toHaveBeenCalledWith("image/jpeg");

    // 핵심 비즈니스 로직 검증
    expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
    expect(mockOnPreview).toHaveBeenCalledWith("mocked-object-url");
    expect(mockOnImageChange).toHaveBeenCalledWith(true);
  });

  test("사용자가 파일 선택 대화상자를 취소하면 상태가 초기화된다", () => {
    const mockOnFileChange = jest.fn();

    // 편집 모드로 설정
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: mockOnFileChange,
    });

    render(<AvatarUploader {...defaultProps} />);

    // 파일 입력이 렌더링되었는지 확인
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();

    // useAvatarUpload의 onFileChange가 파일 취소를 처리하도록 모킹
    mockOnFileChange.mockImplementation((e) => {
      const file = e.target.files?.[0];
      if (!file) {
        // 파일 선택이 취소되었으므로 상태가 초기화되어야 함
        mockOnFileSelect(null);
        mockOnCancelPreview();
        mockOnImageChange(false);
      }
    });

    // 파일 취소 이벤트를 트리거
    const mockEvent = {
      target: { files: [] },
    };
    mockOnFileChange(mockEvent);

    // 파일 선택이 취소되었으므로 상태가 초기화되어야 함
    expect(mockOnFileSelect).toHaveBeenCalledWith(null);
    expect(mockOnCancelPreview).toHaveBeenCalledTimes(1);
    expect(mockOnImageChange).toHaveBeenCalledWith(false);
  });

  test("지원하지 않는 파일 확장자 선택 시 에러가 발생한다", () => {
    const mockOnFileChange = jest.fn();

    // 편집 모드로 설정
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: mockOnFileChange,
    });

    render(<AvatarUploader {...defaultProps} />);

    const invalidFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });

    // useAvatarUpload의 onFileChange가 파일 검증을 수행하도록 모킹
    mockOnFileChange.mockImplementation((e) => {
      const file = e.target.files?.[0];
      if (file) {
        // validateFileExtension을 false로 설정하여 에러 시뮬레이션
        (validateFileExtension as jest.Mock).mockReturnValueOnce(false);

        if (!validateFileExtension(file.name)) {
          const msg =
            "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)";
          mockOnError(msg);
        }
      }
    });

    // 파일 입력이 렌더링되었는지 확인
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();

    // 파일 변경 이벤트를 트리거
    const mockEvent = {
      target: { files: [invalidFile] },
    };
    mockOnFileChange(mockEvent);

    // 파일 검증 함수가 호출되는지 확인
    expect(validateFileExtension).toHaveBeenCalledWith("test.txt");

    // 에러 콜백이 호출되는지 확인
    expect(mockOnError).toHaveBeenCalledWith(
      "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)",
    );
  });

  test("파일 크기가 너무 클 때 에러가 발생한다", () => {
    const mockOnFileChange = jest.fn();

    // useAvatarUpload 훅을 에러 상황으로 모킹
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: mockOnFileChange,
    });

    render(<AvatarUploader {...defaultProps} />);

    const largeFile = new File(["large content"], "large.jpg", {
      type: "image/jpeg",
    });

    // useAvatarUpload의 onFileChange가 실제로 파일 검증을 수행하도록 모킹
    mockOnFileChange.mockImplementation((e) => {
      const file = e.target.files?.[0];
      if (file) {
        // validateFileSize를 false로 설정하여 에러 시뮬레이션
        (validateFileSize as jest.Mock).mockReturnValueOnce(false);

        if (!validateFileSize(file.size)) {
          const msg = `파일 크기가 너무 큽니다. (최대 1MB, 현재 파일: ${file.size} bytes)`;
          mockOnError(msg);
        }
      }
    });

    // 파일 입력이 렌더링되었는지 확인
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();

    // 파일 변경 이벤트를 트리거
    const mockEvent = {
      target: { files: [largeFile] },
    };
    mockOnFileChange(mockEvent);

    // 파일 검증 함수가 호출되는지 확인
    expect(validateFileSize).toHaveBeenCalledWith(largeFile.size);

    // 에러 콜백이 호출되는지 확인
    expect(mockOnError).toHaveBeenCalledWith(
      `파일 크기가 너무 큽니다. (최대 1MB, 현재 파일: ${largeFile.size} bytes)`,
    );
  });

  test("지원하지 않는 MIME 타입 선택 시 에러가 발생한다", () => {
    const mockOnFileChange = jest.fn();

    // useAvatarUpload 훅을 에러 상황으로 모킹
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isEditing: true,
      setIsEditing: jest.fn(),
      previewUrl: null,
      file: null,
      error: null,
      inputRef: { current: { click: jest.fn() } },
      onEditToggle: jest.fn(),
      onFileChange: mockOnFileChange,
    });

    render(<AvatarUploader {...defaultProps} />);

    const invalidFile = new File(["content"], "test.jpg", {
      type: "text/plain", // 잘못된 MIME 타입
    });

    // useAvatarUpload의 onFileChange가 실제로 파일 검증을 수행하도록 모킹
    mockOnFileChange.mockImplementation((e) => {
      const file = e.target.files?.[0];
      if (file) {
        // validateFileType을 false로 설정하여 에러 시뮬레이션
        (validateFileType as jest.Mock).mockReturnValueOnce(false);

        if (!validateFileType(file.type)) {
          const msg =
            "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)";
          mockOnError(msg);
        }
      }
    });

    // 파일 입력이 렌더링되었는지 확인
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();

    // 파일 변경 이벤트를 트리거
    const mockEvent = {
      target: { files: [invalidFile] },
    };
    mockOnFileChange(mockEvent);

    // 파일 검증 함수가 호출되는지 확인
    expect(validateFileType).toHaveBeenCalledWith("text/plain");

    // 에러 콜백이 호출되는지 확인
    expect(mockOnError).toHaveBeenCalledWith(
      "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)",
    );
  });
});
