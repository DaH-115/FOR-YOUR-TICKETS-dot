import { PATCH } from "app/api/users/[uid]/patch.handler";
import { NextRequest } from "next/server";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { createMockRequest } from "__tests__/utils/test-utils";

jest.mock("lib/auth/verifyToken");
jest.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: jest.fn(() => "mock-server-ts") },
}));

const mockUserRef = { get: jest.fn(), update: jest.fn() };
jest.mock("firebase-admin-config", () => ({
  adminFirestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => mockUserRef),
    })),
  },
}));

describe("PATCH /api/users/[uid] (activityLevel)", () => {
  const uid = "user-1";
  const mockedVerifyAuthToken = verifyAuthToken as jest.Mock;
  const mockedVerifyResourceOwnership = verifyResourceOwnership as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedVerifyAuthToken.mockResolvedValue({ success: true, uid });
    mockedVerifyResourceOwnership.mockReturnValue({ success: true });
  });

  test("계약: 유효한 activityLevel이면 200과 message·activityLevel·user를 반환한다", async () => {
    mockUserRef.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ displayName: "테스트" }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          displayName: "테스트",
          activityLevel: "ACTIVE",
        }),
      });

    const req = createMockRequest({
      method: "PATCH",
      body: { activityLevel: "ACTIVE" },
    });
    const res = await PATCH(req as NextRequest, {
      params: Promise.resolve({ uid }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      message: "등급이 성공적으로 업데이트되었습니다.",
      activityLevel: "ACTIVE",
      user: expect.objectContaining({ uid, activityLevel: "ACTIVE" }),
    });
    expect(mockUserRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        activityLevel: "ACTIVE",
        updatedAt: "mock-server-ts",
      }),
    );
  });

  test("계약: 인증 실패 시 401과 error를 반환한다", async () => {
    mockedVerifyAuthToken.mockResolvedValue({
      success: false,
      error: "로그인이 필요합니다.",
      statusCode: 401,
    });
    const req = createMockRequest({
      method: "PATCH",
      body: { activityLevel: "NEWBIE" },
    });
    const res = await PATCH(req as NextRequest, {
      params: Promise.resolve({ uid }),
    });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("로그인이 필요합니다.");
    expect(mockUserRef.update).not.toHaveBeenCalled();
  });

  test("계약: 본인이 아니면 403과 error를 반환한다", async () => {
    mockedVerifyResourceOwnership.mockReturnValue({
      success: false,
      error: "접근 권한이 없습니다.",
      statusCode: 403,
    });
    const req = createMockRequest({
      method: "PATCH",
      body: { activityLevel: "NEWBIE" },
    });
    const res = await PATCH(req as NextRequest, {
      params: Promise.resolve({ uid }),
    });
    expect(res.status).toBe(403);
    expect(mockUserRef.update).not.toHaveBeenCalled();
  });

  test("계약: 유효하지 않은 등급이면 400과 validGrades를 반환한다", async () => {
    const req = createMockRequest({
      method: "PATCH",
      body: { activityLevel: "NOT_A_REAL_GRADE" },
    });
    const res = await PATCH(req as NextRequest, {
      params: Promise.resolve({ uid }),
    });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe("유효하지 않은 등급입니다.");
    expect(Array.isArray(body.validGrades)).toBe(true);
    expect(mockUserRef.update).not.toHaveBeenCalled();
  });

  test("계약: 사용자 문서가 없으면 404를 반환한다", async () => {
    mockUserRef.get.mockResolvedValueOnce({ exists: false });
    const req = createMockRequest({
      method: "PATCH",
      body: { activityLevel: "NEWBIE" },
    });
    const res = await PATCH(req as NextRequest, {
      params: Promise.resolve({ uid }),
    });
    expect(res.status).toBe(404);
    expect(mockUserRef.update).not.toHaveBeenCalled();
  });
});
