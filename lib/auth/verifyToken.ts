import { NextRequest } from "next/server";
import { adminAuth } from "firebase-admin-config";
import type { AuthResult } from "types/auth";

// 타입 re-export (하위 호환성 유지)
export type { AuthResult } from "types/auth";

/**
 * Authorization 헤더에서 Firebase ID Token을 검증합니다.
 *
 * @param req - Next.js Request 객체
 * @returns AuthResult - 인증 결과
 */
export async function verifyAuthToken(req: NextRequest): Promise<AuthResult> {
  try {
    // Authorization 헤더 확인
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        statusCode: 401,
      };
    }

    // Bearer 토큰 형식 확인
    if (!authorization.startsWith("Bearer ")) {
      return {
        success: false,
        error: "잘못된 토큰 형식입니다.",
        statusCode: 401,
      };
    }

    // 토큰 추출
    const idToken = authorization.replace("Bearer ", "");
    if (!idToken) {
      return {
        success: false,
        error: "토큰이 없습니다.",
        statusCode: 401,
      };
    }

    // Firebase Admin SDK로 토큰 검증
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email || undefined,
    };
  } catch (error) {
    console.error("토큰 검증 실패:", error);

    const AUTH_ERRORS: { [key: string]: string } = {
      "auth/id-token-expired": "토큰이 만료되었습니다. 다시 로그인해주세요.",
      "auth/id-token-revoked": "토큰이 취소되었습니다. 다시 로그인해주세요.",
      "auth/invalid-id-token": "유효하지 않은 토큰입니다.",
    };

    let errorMessage = "인증에 실패했습니다.";
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: string }).code === "string"
    ) {
      errorMessage =
        AUTH_ERRORS[(error as { code: string }).code] || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
      statusCode: 401,
    };
  }
}

/**
 * 리소스 소유자 권한을 확인합니다.
 *
 * @param authenticatedUid - 인증된 사용자 UID
 * @param resourceOwnerUid - 리소스 소유자 UID
 * @returns 권한 확인 결과
 */
export function verifyResourceOwnership(
  authenticatedUid: string,
  resourceOwnerUid: string,
): AuthResult {
  if (authenticatedUid !== resourceOwnerUid) {
    return {
      success: false,
      error: "권한이 없습니다.",
      statusCode: 403,
    };
  }

  return {
    success: true,
    uid: authenticatedUid,
  };
}
