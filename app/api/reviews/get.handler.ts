import { NextRequest, NextResponse } from "next/server";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";

// GET /api/reviews - 리뷰 목록 조회 (페이지네이션, 검색, 사용자 필터)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const uid = searchParams.get("uid") ?? undefined;
  const search = searchParams.get("search") ?? "";

  const data = await fetchReviewsPaginated({ page, pageSize, uid, search });
  return NextResponse.json(data);
}
