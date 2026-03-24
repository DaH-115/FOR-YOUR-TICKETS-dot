import { POST } from "@/api/users/me/profile/route";
import {
  createMockRequest,
  createMockAuthToken,
  createMockUser,
  createMockSocialSetupData,
} from "__tests__/utils/test-utils";
import { adminAuth, adminFirestore } from "firebase-admin-config";
import { verifyAuthToken } from "lib/auth/verifyToken";
import admin from "firebase-admin";
import {
  setupSuccessfulSignupMocks,
  setupExistingUserMocks,
  setupAuthFailureMocks,
  setupFirebaseAuthErrorMocks,
  setupFirestoreErrorMocks,
  setupRollbackScenarioMocks,
  createValidSocialSetupRequest,
  createUnauthorizedRequest,
  createInvalidTokenRequest,
  expectUserCreatedSuccessfully,
  expectExistingUserLoginSuccess,
  expectAuthFailure,
  expectServerError,
} from "__tests__/api/auth/test-helpers";

jest.mock("firebase-admin-config", () => ({
  adminAuth: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
  },
  adminFirestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
    runTransaction: jest.fn(),
  },
}));

jest.mock("lib/auth/verifyToken", () => ({
  verifyAuthToken: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("POST /api/users/me/profile", () => {
  // 테스트에서 사용할 mock 객체 및 변수 선언
  let mockAdminAuth: Partial<admin.auth.Auth> & { [key: string]: unknown };
  let mockAdminFirestore: Partial<admin.firestore.Firestore> & {
    [key: string]: unknown;
  };
  let mockVerifyAuthToken: jest.Mock;
  let mockUserDoc: { exists: boolean; data: jest.Mock };

  beforeEach(() => {
    // 각 테스트 실행 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockAdminAuth = adminAuth as unknown as Partial<admin.auth.Auth> & {
      [key: string]: unknown;
    };
    mockAdminFirestore =
      adminFirestore as unknown as Partial<admin.firestore.Firestore> & {
        [key: string]: unknown;
      };
    mockVerifyAuthToken = verifyAuthToken as jest.Mock;
    // Firestore user 문서 mock (존재 여부 및 data 반환)
    mockUserDoc = {
      exists: false,
      data: jest.fn(),
    };
    (mockAdminFirestore.collection as jest.Mock).mockReturnValue({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue(mockUserDoc),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    });
    // 기본적으로 인증 성공 상황으로 mock
    mockVerifyAuthToken.mockResolvedValue({
      success: true,
      uid: "test-user-id",
    });
  });

  describe("성공 케이스", () => {
    test("기존 사용자 로그인이 성공해야 합니다", async () => {
      setupExistingUserMocks(mockUserDoc);

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectExistingUserLoginSuccess(response, result);
    });

    test("신규 사용자 회원가입이 성공해야 합니다", async () => {
      setupSuccessfulSignupMocks(
        mockAdminAuth,
        mockAdminFirestore,
        mockUserDoc,
      );

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectUserCreatedSuccessfully(response, result);
    });
  });

  describe("인증 실패 케이스", () => {
    test("인증 토큰이 없으면 401 에러를 반환해야 합니다", async () => {
      setupAuthFailureMocks(mockVerifyAuthToken, "로그인이 필요합니다.");

      const response = await POST(createUnauthorizedRequest());
      const result = await response.json();

      expectAuthFailure(response, result, "로그인이 필요합니다.");
    });

    test("잘못된 인증 토큰이면 401 에러를 반환해야 합니다", async () => {
      setupAuthFailureMocks(mockVerifyAuthToken, "유효하지 않은 토큰입니다.");

      const response = await POST(createInvalidTokenRequest());
      const result = await response.json();

      expectAuthFailure(response, result, "유효하지 않은 토큰입니다.");
    });
  });

  describe("유효성 검증 실패 케이스", () => {
    test("provider가 없으면 400 에러를 반환해야 합니다", async () => {
      // provider 필드가 없을 때 400 에러 반환
      const request = createMockRequest({
        method: "POST",
        headers: { authorization: `Bearer ${createMockAuthToken()}` },
        body: {},
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("유효하지 않은 소셜 로그인 제공자입니다.");
    });

    test("유효하지 않은 provider면 400 에러를 반환해야 합니다", async () => {
      // 허용되지 않은 provider 값일 때 400 에러 반환
      const invalidData = createMockSocialSetupData({ provider: "invalid" });
      const request = createMockRequest({
        method: "POST",
        headers: { authorization: `Bearer ${createMockAuthToken()}` },
        body: invalidData,
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("유효하지 않은 소셜 로그인 제공자입니다.");
    });

    test("지원하지 않는 provider면 400 에러를 반환해야 합니다", async () => {
      // 지원하지 않는 provider 값일 때 400 에러 반환
      const invalidData = createMockSocialSetupData({ provider: "facebook" });
      const request = createMockRequest({
        method: "POST",
        headers: { authorization: `Bearer ${createMockAuthToken()}` },
        body: invalidData,
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("유효하지 않은 소셜 로그인 제공자입니다.");
    });
  });

  describe("닉네임 생성 실패 케이스", () => {
    test("유일한 닉네임 생성에 실패하면 500 에러를 반환해야 합니다", async () => {
      mockUserDoc.exists = false;
      (mockAdminAuth.getUser as jest.Mock).mockResolvedValue(createMockUser());
      (mockAdminFirestore.runTransaction as jest.Mock).mockRejectedValue(
        new Error("Transaction failed"),
      );

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectServerError(
        response,
        result,
        "사용자 프로필 생성 중 오류가 발생했습니다.",
      );
    });
  });

  describe("Firebase 에러 처리", () => {
    test("Firebase Auth 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
      mockUserDoc.exists = false;
      setupFirebaseAuthErrorMocks(mockAdminAuth, "Firebase Auth error");

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectServerError(
        response,
        result,
        "사용자 프로필 생성 중 오류가 발생했습니다.",
      );
    });

    test("Firestore 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
      setupFirestoreErrorMocks(mockAdminFirestore, "Firestore error");

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectServerError(
        response,
        result,
        "소셜 로그인 처리 중 오류가 발생했습니다.",
      );
    });
  });

  describe("프로필 생성 실패 시 롤백", () => {
    test("프로필 생성 실패 시 생성된 닉네임을 롤백해야 합니다", async () => {
      const mockDelete = setupRollbackScenarioMocks(
        mockAdminAuth,
        mockAdminFirestore,
        mockUserDoc,
      );

      const response = await POST(createValidSocialSetupRequest());
      const result = await response.json();

      expectServerError(
        response,
        result,
        "사용자 프로필 생성 중 오류가 발생했습니다.",
      );
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
