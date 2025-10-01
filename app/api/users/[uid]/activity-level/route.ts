import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { gradeInfoData } from "lib/utils/getActivityLevel";
import { FieldValue } from "firebase-admin/firestore";

// PUT /api/users/[uid]/activity-level - 사용자 활동 등급 업데이트
export async function PUT(
  req: NextRequest,
  { params }: { params: { uid: string } },
) {
  try {
    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    // 본인 등급만 변경 가능
    const ownershipResult = verifyResourceOwnership(
      authResult.uid!,
      params.uid,
    );
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    // 요청 본문 파싱
    const body = await req.json();
    const { activityLevel } = body;

    // 유효한 등급인지 확인
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

    // Firestore에서 사용자 등급 업데이트
    const userRef = adminFirestore.collection("users").doc(params.uid);

    // 사용자 존재 확인
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 등급 업데이트
    await userRef.update({
      activityLevel,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 업데이트된 사용자 정보 조회
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    return NextResponse.json({
      message: "등급이 성공적으로 업데이트되었습니다.",
      activityLevel,
      user: {
        uid: params.uid,
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
