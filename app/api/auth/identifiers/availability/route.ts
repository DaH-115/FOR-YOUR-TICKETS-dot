import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "firebase-admin-config";

// POST /api/auth/identifiers/availability - 가입 식별자(닉네임·이메일) 사용 가능 여부
export async function POST(req: NextRequest) {
  try {
    const { type, value } = await req.json();

    // 필수 필드 검증
    if (!type || !value?.trim()) {
      return NextResponse.json(
        { error: "type과 value가 필요합니다." },
        { status: 400 },
      );
    }

    const trimmedValue = value.trim();

    if (type === "displayName") {
      // 닉네임 중복 검사
      if (trimmedValue.length < 2 || trimmedValue.length > 30) {
        return NextResponse.json(
          { error: "닉네임은 2-30글자 사이여야 합니다." },
          { status: 400 },
        );
      }

      const usernameRef = adminFirestore
        .collection("usernames")
        .doc(trimmedValue);
      const usernameDoc = await usernameRef.get();

      const isAvailable = !usernameDoc.exists;

      return NextResponse.json(
        {
          available: isAvailable,
          message: isAvailable
            ? "사용 가능한 닉네임입니다."
            : "이미 사용 중인 닉네임입니다.",
        },
        { status: 200 },
      );
    } else if (type === "email") {
      // 이메일 중복 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return NextResponse.json(
          { error: "올바른 이메일 형식이 아닙니다." },
          { status: 400 },
        );
      }

      try {
        // Firebase Auth에서 이메일 중복 검사
        await adminAuth.getUserByEmail(trimmedValue);
        // 사용자가 존재하면 중복
        return NextResponse.json(
          {
            available: false,
            message: "이미 사용 중인 이메일입니다.",
          },
          { status: 200 },
        );
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "auth/user-not-found"
        ) {
          // 사용자가 없으면 사용 가능
          return NextResponse.json(
            {
              available: true,
              message: "사용 가능한 이메일입니다.",
            },
            { status: 200 },
          );
        } else {
          throw error;
        }
      }
    } else {
      return NextResponse.json(
        { error: "type은 'displayName' 또는 'email'이어야 합니다." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("중복 검사 API 에러:", error);
    return NextResponse.json(
      { error: "중복 검사 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
