import { NextRequest, NextResponse } from "next/server";
import { getReviewById } from "lib/reviews/getReviewById";
import { verifyAuthToken } from "lib/auth/verifyToken";

// GET /api/reviews/[id] - 개별 리뷰 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // 1순위: Authorization 헤더로 인증 → uid 획득, 2순위: 쿼리 파라미터 uid 폴백
    let uid: string | null = null;
    const authResult = await verifyAuthToken(req);
    if (authResult.success && authResult.uid) {
      uid = authResult.uid;
    } else {
      uid = req.nextUrl.searchParams.get("uid");
    }

    const review = await getReviewById(id, uid);

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("리뷰 조회 실패:", error);
    console.error(
      "에러 스택:",
      error instanceof Error ? error.stack : "Unknown error",
    );
    return NextResponse.json(
      { error: "리뷰 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
