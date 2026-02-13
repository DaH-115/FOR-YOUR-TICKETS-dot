import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";

// PUT /api/reviews/[id] - 리뷰 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const updateData = await req.json();

    if (
      !updateData.reviewTitle ||
      !updateData.reviewContent ||
      !updateData.rating
    ) {
      return NextResponse.json(
        { error: "reviewTitle, reviewContent, rating이 필요합니다." },
        { status: 400 },
      );
    }

    const reviewRef = adminFirestore.collection("movie-reviews").doc(id);

    // 문서 존재 확인
    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 리뷰 작성자 권한 확인
    const reviewData = reviewSnap.data();
    const ownershipResult = verifyResourceOwnership(
      authResult.uid!,
      reviewData!.user.uid,
    );
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    // 리뷰 업데이트
    await reviewRef.update({
      "review.reviewTitle": updateData.reviewTitle,
      "review.reviewContent": updateData.reviewContent,
      "review.rating": updateData.rating,
      "review.updatedAt": FieldValue.serverTimestamp(),
    });

    // 캐시 재검증
    revalidatePath("/ticket-list");
    revalidatePath("/my-page/my-ticket-list");
    revalidatePath("/");
    revalidateTag("reviews");

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 수정 실패:", error);
    return NextResponse.json(
      { error: "리뷰 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}
