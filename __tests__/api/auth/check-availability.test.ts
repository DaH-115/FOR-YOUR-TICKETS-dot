import { POST } from "@/api/auth/check-availability/route";
import {
  createMockRequest,
  createMockAvailabilityCheckData,
  createMockUser,
  createMockFirebaseError,
} from "__tests__/utils/test-utils";
import { adminAuth, adminFirestore } from "firebase-admin-config";
import admin from "firebase-admin";

jest.mock("firebase-admin-config", () => ({
  adminAuth: {
    getUserByEmail: jest.fn(),
  },
  adminFirestore: {
    collection: jest.fn(),
  },
}));

describe("/api/auth/check-availability", () => {
  // Firebase Admin mock 객체 및 테스트용 변수 선언
  let mockAdminAuth: admin.auth.Auth;
  let mockAdminFirestore: admin.firestore.Firestore;
  // Firestore 닉네임 문서 mock의 exists 속성만 사용
  let mockUsernameDoc: Partial<admin.firestore.DocumentSnapshot> & {
    exists: boolean;
  };

  beforeEach(() => {
    // 각 테스트 실행 전 mock 및 상태 초기화
    jest.clearAllMocks();
    mockAdminAuth = adminAuth as admin.auth.Auth;
    mockAdminFirestore = adminFirestore as admin.firestore.Firestore;
    mockUsernameDoc = { exists: false };
    // Firestore 닉네임 문서 mock 세팅 (존재 여부 시뮬레이션)
    (mockAdminFirestore.collection as jest.Mock).mockReturnValue({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue(mockUsernameDoc),
      })),
    });
  });

  describe("닉네임 중복 검사", () => {
    test("사용 가능한 닉네임이면 available: true를 반환해야 합니다", async () => {
      // 닉네임이 DB에 존재하지 않는 경우(중복 아님) 시나리오
      // 기대 결과: available: true, 정상 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "displayName",
        value: "availableNickname",
      }) as Record<string, unknown>;

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.available).toBe(true);
      expect(result.message).toBe("사용 가능한 닉네임입니다.");
    });

    test("이미 사용 중인 닉네임이면 available: false를 반환해야 합니다", async () => {
      // 닉네임이 이미 DB에 존재하는 경우(중복) 시나리오
      // 기대 결과: available: false, 중복 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "displayName",
        value: "existingNickname",
      }) as Record<string, unknown>;

      mockUsernameDoc = { exists: true };
      (mockAdminFirestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockUsernameDoc),
        })),
      });

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.available).toBe(false);
      expect(result.message).toBe("이미 사용 중인 닉네임입니다.");
    });

    test("닉네임이 2글자 미만이면 400 에러를 반환해야 합니다", async () => {
      // 닉네임 길이 유효성(최소 2글자) 검증
      const checkData = createMockAvailabilityCheckData({
        type: "displayName",
        value: "a",
      }) as Record<string, unknown>;

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("닉네임은 2-30글자 사이여야 합니다.");
    });

    test("닉네임이 30글자 초과면 400 에러를 반환해야 합니다", async () => {
      // 닉네임 길이 유효성(최대 30글자) 검증
      const longNickname = "a".repeat(31);
      const checkData = createMockAvailabilityCheckData({
        type: "displayName",
        value: longNickname,
      }) as Record<string, unknown>;

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("닉네임은 2-30글자 사이여야 합니다.");
    });
  });

  describe("이메일 중복 검사", () => {
    test("사용 가능한 이메일이면 available: true를 반환해야 합니다", async () => {
      // Firebase에 해당 이메일이 없는 경우(중복 아님) 시나리오
      // 기대 결과: available: true, 정상 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "email",
        value: "available@example.com",
      }) as Record<string, unknown>;

      const userNotFoundError = createMockFirebaseError(
        "auth/user-not-found",
        "User not found",
      );
      (mockAdminAuth.getUserByEmail as jest.Mock).mockRejectedValue(
        userNotFoundError,
      );

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.available).toBe(true);
      expect(result.message).toBe("사용 가능한 이메일입니다.");
    });

    test("이미 사용 중인 이메일이면 available: false를 반환해야 합니다", async () => {
      // Firebase에 이미 등록된 이메일(중복) 시나리오
      // 기대 결과: available: false, 중복 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "email",
        value: "existing@example.com",
      }) as Record<string, unknown>;

      const mockUser = createMockUser({ email: "existing@example.com" });
      (mockAdminAuth.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.available).toBe(false);
      expect(result.message).toBe("이미 사용 중인 이메일입니다.");
    });

    test("잘못된 이메일 형식이면 400 에러를 반환해야 합니다", async () => {
      // 이메일 형식 유효성 검증
      // 기대 결과: 400 에러 및 에러 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "email",
        value: "invalid-email",
      }) as Record<string, unknown>;

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("올바른 이메일 형식이 아닙니다.");
    });
  });

  describe("유효성 검증 실패 케이스", () => {
    test("type 필드가 없으면 400 에러를 반환해야 합니다", async () => {
      // 필수 필드(type) 누락 시나리오
      // 기대 결과: 400 에러 및 에러 메시지 반환
      const invalidData = { value: "test" };
      const request = createMockRequest({ body: invalidData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("type과 value가 필요합니다.");
    });

    test("value 필드가 없으면 400 에러를 반환해야 합니다", async () => {
      // 필수 필드(value) 누락 시나리오
      // 기대 결과: 400 에러 및 에러 메시지 반환
      const invalidData = { type: "displayName" };
      const request = createMockRequest({ body: invalidData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("type과 value가 필요합니다.");
    });

    test("알 수 없는 type이면 400 에러를 반환해야 합니다", async () => {
      // 허용되지 않은 type 값 입력 시나리오
      // 기대 결과: 400 에러 및 에러 메시지 반환
      const invalidData = { type: "invalid", value: "test" };
      const request = createMockRequest({ body: invalidData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe(
        "type은 'displayName' 또는 'email'이어야 합니다.",
      );
    });
  });

  describe("서버 에러 케이스", () => {
    test("Firebase Auth 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
      // Firebase Auth에서 예외 발생 시나리오
      // 기대 결과: 500 에러 및 에러 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "email",
        value: "error@example.com",
      }) as Record<string, unknown>;
      const firebaseError = createMockFirebaseError(
        "auth/internal-error",
        "Internal error",
      );
      (mockAdminAuth.getUserByEmail as jest.Mock).mockRejectedValue(
        firebaseError,
      );

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("중복 검사 처리 중 오류가 발생했습니다.");
    });

    test("Firestore 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
      // Firestore에서 예외 발생 시나리오
      // 기대 결과: 500 에러 및 에러 메시지 반환
      const checkData = createMockAvailabilityCheckData({
        type: "displayName",
        value: "error-nickname",
      }) as Record<string, unknown>;
      (mockAdminFirestore.collection as jest.Mock).mockImplementation(() => {
        throw new Error("Firestore error");
      });

      const request = createMockRequest({ body: checkData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("중복 검사 처리 중 오류가 발생했습니다.");
    });
  });
});
