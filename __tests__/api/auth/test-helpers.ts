import admin from "firebase-admin";
import {
  createMockRequest,
  createMockAuthToken,
  createMockSocialSetupData,
  createMockUser,
} from "__tests__/utils/test-utils";

// Firebase Admin mock 타입 정의
type MockAdminAuth = Partial<admin.auth.Auth> & { [key: string]: unknown };
type MockAdminFirestore = Partial<admin.firestore.Firestore> & {
  [key: string]: unknown;
};

/**
 * 성공적인 회원가입을 위한 모킹 설정
 */
export const setupSuccessfulSignupMocks = (
  mockAdminAuth: MockAdminAuth,
  mockAdminFirestore: MockAdminFirestore,
  mockUserDoc: { exists: boolean; data: jest.Mock },
) => {
  mockUserDoc.exists = false;
  (mockAdminAuth.getUser as jest.Mock).mockResolvedValue(createMockUser());
  (mockAdminAuth.updateUser as jest.Mock).mockResolvedValue(createMockUser());
  setupFirestoreTransactionMock(mockAdminFirestore, false);
};

/**
 * Firestore 트랜잭션 모킹 설정
 */
export const setupFirestoreTransactionMock = (
  mockAdminFirestore: MockAdminFirestore,
  shouldFail: boolean = false,
) => {
  if (shouldFail) {
    (mockAdminFirestore.runTransaction as jest.Mock).mockRejectedValue(
      new Error("Transaction failed"),
    );
  } else {
    (mockAdminFirestore.runTransaction as jest.Mock).mockImplementation(
      async (
        callback: (arg: { get: jest.Mock; set: jest.Mock }) => Promise<unknown>,
      ) => {
        return callback({
          get: jest.fn().mockResolvedValue({ exists: false }),
          set: jest.fn(),
        });
      },
    );
  }
};

/**
 * 성공적인 기존 사용자 로그인을 위한 모킹 설정
 */
export const setupExistingUserMocks = (mockUserDoc: {
  exists: boolean;
  data: jest.Mock;
}) => {
  mockUserDoc.exists = true;
  mockUserDoc.data.mockReturnValue({
    displayName: "Test User",
    provider: "google",
  });
};

/**
 * 인증 실패를 위한 모킹 설정
 */
export const setupAuthFailureMocks = (
  mockVerifyAuthToken: jest.Mock,
  errorMessage: string = "로그인이 필요합니다.",
) => {
  mockVerifyAuthToken.mockResolvedValue({
    success: false,
    error: errorMessage,
    statusCode: 401,
  });
};

/**
 * Firebase Auth 에러를 위한 모킹 설정
 */
export const setupFirebaseAuthErrorMocks = (
  mockAdminAuth: MockAdminAuth,
  errorMessage: string = "Firebase Auth error",
) => {
  (mockAdminAuth.getUser as jest.Mock).mockRejectedValue(
    new Error(errorMessage),
  );
};

/**
 * Firestore 에러를 위한 모킹 설정
 */
export const setupFirestoreErrorMocks = (
  mockAdminFirestore: MockAdminFirestore,
  errorMessage: string = "Firestore error",
) => {
  (mockAdminFirestore.collection as jest.Mock).mockImplementation(() => {
    throw new Error(errorMessage);
  });
};

/**
 * 롤백 시나리오를 위한 복잡한 모킹 설정
 */
export const setupRollbackScenarioMocks = (
  mockAdminAuth: MockAdminAuth,
  mockAdminFirestore: MockAdminFirestore,
  mockUserDoc: { exists: boolean; data: jest.Mock },
) => {
  const mockUser = createMockUser({ displayName: "generated-nickname" });
  mockUserDoc.exists = false;
  (mockAdminAuth.getUser as jest.Mock).mockResolvedValue(mockUser);
  (mockAdminAuth.updateUser as jest.Mock).mockResolvedValue(mockUser);
  (mockAdminFirestore.runTransaction as jest.Mock).mockResolvedValue(
    "generated-nickname",
  );

  const mockDelete = jest.fn();
  (mockAdminFirestore.collection as jest.Mock).mockReturnValue({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockUserDoc),
      set: jest.fn().mockRejectedValue(new Error("Firestore set error")),
      update: jest.fn(),
      delete: mockDelete,
    })),
  });

  return mockDelete;
};

/**
 * 유효한 소셜 로그인 요청 생성
 */
export const createValidSocialSetupRequest = () => {
  return createMockRequest({
    method: "POST",
    headers: { authorization: `Bearer ${createMockAuthToken()}` },
    body: createMockSocialSetupData(),
  });
};

/**
 * 인증 토큰이 없는 요청 생성
 */
export const createUnauthorizedRequest = () => {
  return createMockRequest({
    method: "POST",
    body: createMockSocialSetupData(),
  });
};

/**
 * 잘못된 토큰이 있는 요청 생성
 */
export const createInvalidTokenRequest = () => {
  return createMockRequest({
    method: "POST",
    headers: { authorization: "Bearer invalid-token" },
    body: createMockSocialSetupData(),
  });
};

/**
 * 사용자 생성 성공 검증
 */
export const expectUserCreatedSuccessfully = (
  response: Response,
  result: unknown,
) => {
  const data = result as {
    success: boolean;
    message: string;
    data: {
      isNewUser: boolean;
      uid: string;
      provider: string;
      displayName: string;
    };
  };
  expect(response.status).toBe(201);
  expect(data.success).toBe(true);
  expect(data.message).toBe("회원가입이 완료되었습니다.");
  expect(data.data.isNewUser).toBe(true);
  expect(data.data.uid).toBe("test-user-id");
  expect(data.data.provider).toBe("google");
  expect(data.data.displayName).toMatch(/^user\d+_[a-z0-9]+$/);
};

/**
 * 기존 사용자 로그인 성공 검증
 */
export const expectExistingUserLoginSuccess = (
  response: Response,
  result: unknown,
) => {
  const data = result as {
    success: boolean;
    message: string;
    data: {
      isNewUser: boolean;
      uid: string;
      displayName: string;
      provider: string;
    };
  };
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.message).toBe("로그인 성공");
  expect(data.data.isNewUser).toBe(false);
  expect(data.data.uid).toBe("test-user-id");
  expect(data.data.displayName).toBe("Test User");
  expect(data.data.provider).toBe("google");
};

/**
 * 인증 실패 검증
 */
export const expectAuthFailure = (
  response: Response,
  result: unknown,
  expectedError: string,
) => {
  const data = result as { error: string };
  expect(response.status).toBe(401);
  expect(data.error).toBe(expectedError);
};

/**
 * 서버 에러 검증
 */
export const expectServerError = (
  response: Response,
  result: unknown,
  expectedError: string,
) => {
  const data = result as { error: string };
  expect(response.status).toBe(500);
  expect(data.error).toBe(expectedError);
};
