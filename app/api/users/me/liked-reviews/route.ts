import { NextRequest, NextResponse } from "next/server";
import { fetchLikedReviewsPaginated } from "lib/reviews/fetchLikedReviewsPaginated";
import { verifyAuthToken } from "lib/auth/verifyToken";

// GET /api/users/me/liked-reviews - 현재 사용자가 좋아요한 리뷰 목록(페이지네이션)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // 인증 헤더 우선: 요청자 본인의 uid만 허용
  const authLike = await verifyAuthToken(req);
  const uid = authLike.success && authLike.uid ? authLike.uid : null;
  if (!uid) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: authLike.statusCode || 401 },
    );
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
  const search = url.searchParams.get("search") || "";

  try {
    const result = await fetchLikedReviewsPaginated({
      uid,
      page,
      pageSize,
      search,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("fetchLikedReviewsPaginated 오류:", error);
    const message =
      error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
