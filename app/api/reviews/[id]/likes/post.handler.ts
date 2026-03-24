import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken } from "lib/auth/verifyToken";

/**
 * POST /api/reviews/[id]/likes
 * 리뷰 하위 컬렉션에 현재 사용자의 좋아요 문서를 만듭니다.
 * 저장 경로: movie-reviews/{reviewId}/likedBy/{uid}
 * 요청 본문은 사용하지 않으며, 리뷰 존재 여부는 Firestore 문서 exists만으로 판단합니다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reviewId } = await params;

    // Bearer 토큰으로 좋아요를 누를 사용자 식별
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const uid = authResult.uid!;
    const reviewRef = adminFirestore.collection("movie-reviews").doc(reviewId);
    const likeRef = reviewRef.collection("likedBy").doc(uid);

    // 리뷰 문서가 실제로 있는지 확인(필드 값·영화 제목 등은 검증에 사용하지 않음)
    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 동일 사용자의 중복 좋아요 방지
    const likeSnap = await likeRef.get();
    if (likeSnap.exists) {
      return NextResponse.json(
        { error: "이미 좋아요한 리뷰입니다." },
        { status: 409 },
      );
    }

    // 좋아요 문서 생성 + 리뷰 likeCount + 사용자 likedTicketsCount를 한 번에 반영
    await adminFirestore.runTransaction(async (transaction) => {
      transaction.set(likeRef, {
        uid,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.update(reviewRef, {
        likeCount: FieldValue.increment(1),
      });
      const userRef = adminFirestore.collection("users").doc(uid);
      transaction.update(userRef, {
        likedTicketsCount: FieldValue.increment(1),
      });
    });

    // 클라이언트에 최신 카운트 전달
    const updatedReviewSnap = await reviewRef.get();
    const updatedLikeCount = updatedReviewSnap.data()?.likeCount || 0;

    revalidatePath("/ticket-list");
    revalidatePath("/my-page/liked-ticket-list");

    return NextResponse.json(
      {
        success: true,
        message: "좋아요가 추가되었습니다.",
        likeCount: updatedLikeCount,
        isLiked: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("좋아요 추가 실패:", error);
    return NextResponse.json(
      { error: "좋아요 추가에 실패했습니다." },
      { status: 500 },
    );
  }
}
