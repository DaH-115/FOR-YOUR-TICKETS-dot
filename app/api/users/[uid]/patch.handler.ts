import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { gradeInfoData } from "lib/utils/getActivityLevel";

/**
 * PATCH /api/users/[uid]
 * 사용자 리소스의 일부 필드만 갱신합니다.
 * 현재 지원: activityLevel (활동 등급). 추후 다른 필드 부분 수정이 필요하면 이 핸들러에 확장합니다.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;

    // Bearer 토큰으로 요청자 확인
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    // 경로의 uid와 로그인 uid가 일치할 때만 수정 허용
    const ownershipResult = verifyResourceOwnership(authResult.uid!, uid);
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    const body = await req.json();
    const { activityLevel } = body as { activityLevel?: string };

    // 앱에서 정의한 등급 라벨만 허용 (임의 문자열 저장 방지)
    const validGrades = gradeInfoData.map((grade) => grade.label);
    if (!activityLevel || !validGrades.includes(activityLevel)) {
      return NextResponse.json(
        {
          error: "유효하지 않은 등급입니다.",
          validGrades,
        },
        { status: 400 },
      );
    }

    const userRef = adminFirestore.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    await userRef.update({
      activityLevel,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 클라이언트가 최신 프로필을 바로 반영할 수 있도록 갱신 후 문서를 다시 읽음
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    return NextResponse.json({
      message: "등급이 성공적으로 업데이트되었습니다.",
      activityLevel,
      user: {
        uid,
        ...updatedUserData,
      },
    });
  } catch (error) {
    console.error("등급 업데이트 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
