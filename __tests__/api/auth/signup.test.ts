import { POST } from "@/api/auth/signup/route";
import {
  createMockRequest,
  createMockSignupData,
  createMockUser,
  createMockFirebaseError,
} from "__tests__/utils/test-utils";
import { adminAuth, adminFirestore } from "firebase-admin-config";
import admin from "firebase-admin";

jest.mock("firebase-admin-config", () => ({
  adminAuth: {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    deleteUser: jest.fn(),
  },
  adminFirestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
    batch: jest.fn(() => ({
      set: jest.fn(),
      commit: jest.fn(),
    })),
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// 회원가입 API 테스트
describe("/api/auth/signup", () => {
  // Firebase Admin mock 객체 및 테스트용 변수 선언
  let mockAdminAuth: Partial<admin.auth.Auth> & { [key: string]: unknown };
  let mockAdminFirestore: Partial<admin.firestore.Firestore> & {
    [key: string]: unknown;
  };
  let mockBatch: { set: jest.Mock; commit: jest.Mock };
  // Firestore 닉네임 문서 mock의 exists 속성만 사용
  let mockUsernameDoc: Partial<admin.firestore.DocumentSnapshot> & {
    exists: boolean;
  };

  // 각 테스트 실행 전 mock 및 상태 초기화
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminAuth = adminAuth as unknown as Partial<admin.auth.Auth> & {
      [key: string]: unknown;
    };
    mockAdminFirestore =
      adminFirestore as unknown as Partial<admin.firestore.Firestore> & {
        [key: string]: unknown;
      };
    // 가짜 batch 객체 생성
    mockBatch = {
      set: jest.fn(),
      commit: jest.fn(),
    };
    // Firestore 닉네임 문서 mock 세팅 (존재 여부 시뮬레이션)
    mockUsernameDoc = { exists: false };
    (mockAdminFirestore.batch as jest.Mock).mockReturnValue(mockBatch);
    (mockAdminFirestore.collection as jest.Mock).mockReturnValue({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue(mockUsernameDoc),
      })),
    });
  });

  // 회원가입 성공 시나리오
  describe("성공 케이스", () => {
    test("올바른 데이터로 회원가입이 성공해야 합니다", async () => {
      // 정상적인 회원가입 데이터로 요청 시, 회원가입이 성공적으로 처리되는지 검증
      const signupData = createMockSignupData();
      const mockUser = createMockUser();
      (mockAdminAuth.createUser as jest.Mock).mockResolvedValue(
        mockUser as admin.auth.UserRecord,
      );
      mockBatch.commit!.mockResolvedValue(undefined);
      const request = createMockRequest({
        method: "POST",
        body: signupData as Record<string, unknown>,
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(201); // 201 Created
      expect(result.success).toBe(true);
      expect(result.message).toBe("회원가입이 완료되었습니다.");
      expect(result.data.uid).toBe(mockUser.uid);
      // createUser가 올바른 인자로 호출되었는지 검증
      expect(mockAdminAuth.createUser).toHaveBeenCalledWith({
        email: signupData.email,
        password: signupData.password,
        displayName: signupData.displayName,
      });
    });
  });

  // 유효성 검증 실패 시나리오
  describe("유효성 검증 실패 케이스", () => {
    test("필수 필드가 비어있으면 400 에러를 반환해야 합니다", async () => {
      // 필수 입력값이 비어있는 경우 400 에러 반환 검증
      const invalidData = { displayName: "", email: "", password: "" };
      const request = createMockRequest({ body: invalidData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("모든 필드를 입력해주세요.");
    });

    test("닉네임이 2글자 미만이면 400 에러를 반환해야 합니다", async () => {
      // 닉네임 길이 유효성(최소 2글자) 검증
      const invalidData = createMockSignupData({ displayName: "a" });
      const request = createMockRequest({ method: "POST", body: invalidData });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("닉네임은 2-30글자 사이여야 합니다.");
    });

    test("닉네임이 30글자 초과면 400 에러를 반환해야 합니다", async () => {
      // 닉네임 길이 유효성(최대 30글자) 검증
      const longDisplayName = "a".repeat(31);
      const invalidData = createMockSignupData({
        displayName: longDisplayName,
      });
      const request = createMockRequest({ method: "POST", body: invalidData });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("닉네임은 2-30글자 사이여야 합니다.");
    });

    test("잘못된 이메일 형식이면 400 에러를 반환해야 합니다", async () => {
      // 이메일 형식 유효성 검증
      const invalidData = createMockSignupData({ email: "invalid-email" });
      const request = createMockRequest({ body: invalidData, method: "POST" });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("올바른 이메일 형식이 아닙니다.");
    });

    test("약한 비밀번호면 400 에러를 반환해야 합니다", async () => {
      // 비밀번호 강도 유효성(8자 이상, 숫자/특수문자 포함) 검증
      const invalidData = createMockSignupData({ password: "weak" });
      const request = createMockRequest({ method: "POST", body: invalidData });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe(
        "비밀번호는 8자 이상이며, 숫자와 특수문자를 포함해야 합니다.",
      );
    });
  });

  // 닉네임/이메일 중복 검사 실패 시나리오
  describe("중복 검사 실패 케이스", () => {
    test("닉네임이 이미 사용 중이면 409 에러를 반환해야 합니다", async () => {
      // 닉네임이 이미 존재하는 경우 409 에러 반환 검증
      mockUsernameDoc.exists = true;
      const request = createMockRequest({
        body: createMockSignupData(),
        method: "POST",
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(409);
      expect(result.error).toBe("이미 사용 중인 닉네임입니다.");
    });

    test("이메일이 이미 사용 중이면 409 에러를 반환해야 합니다", async () => {
      // 이메일이 이미 존재하는 경우 409 에러 반환 검증
      const firebaseError = createMockFirebaseError(
        "auth/email-already-exists",
        "Email already exists",
      );
      (mockAdminAuth.createUser as jest.Mock).mockRejectedValue(firebaseError);
      const request = createMockRequest({
        body: createMockSignupData(),
        method: "POST",
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(409);
      expect(result.error).toBe("이미 사용 중인 이메일입니다.");
    });
  });

  // Firebase 에러 및 롤백 처리 시나리오
  describe("Firebase 에러 처리", () => {
    test("Firebase Auth 에러가 발생하면 적절한 에러 메시지를 반환해야 합니다", async () => {
      // Firebase Auth에서 유효하지 않은 이메일 등 에러 발생 시 400 에러 반환 검증
      const firebaseError = createMockFirebaseError(
        "auth/invalid-email",
        "Invalid email",
      );
      (mockAdminAuth.createUser as jest.Mock).mockRejectedValue(firebaseError);
      const request = createMockRequest({
        body: createMockSignupData(),
        method: "POST",
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("유효하지 않은 이메일입니다.");
    });

    test("Firestore 트랜잭션 실패 시 사용자 롤백을 수행해야 합니다", async () => {
      // Firestore 저장 실패 시, 생성된 유저를 롤백(삭제)하는지 검증
      const signupData = createMockSignupData();
      const mockUser = createMockUser();
      (mockAdminAuth.createUser as jest.Mock).mockResolvedValue(
        mockUser as admin.auth.UserRecord,
      );
      mockBatch.commit!.mockRejectedValue(new Error("Firestore error"));
      (mockAdminAuth.getUserByEmail as jest.Mock).mockResolvedValue(
        mockUser as admin.auth.UserRecord,
      );
      (mockAdminAuth.deleteUser as jest.Mock).mockResolvedValue(undefined);
      const request = createMockRequest({
        body: signupData,
        method: "POST",
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(500);
      expect(result.error).toBe("회원가입 처리 중 오류가 발생했습니다.");
      expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith(mockUser.uid);
    });
  });

  // 서버 에러 처리 시나리오
  describe("서버 에러 처리", () => {
    test("예상치 못한 에러가 발생하면 500 에러를 반환해야 합니다", async () => {
      // Firestore 등에서 예상치 못한 예외 발생 시 500 에러 반환 검증
      const signupData = createMockSignupData();
      (mockAdminFirestore.collection as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });
      const request = createMockRequest({
        method: "POST",
        body: signupData,
      });
      const response = await POST(request);
      const result = await response.json();
      expect(response.status).toBe(500);
      expect(result.error).toBe("회원가입 처리 중 오류가 발생했습니다.");
    });
  });
});
