import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken } from "lib/auth/verifyToken";

// DELETE /api/reviews/[id]/likes/me - 현재 사용자의 좋아요 관계 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reviewId } = await params;

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

    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const likeSnap = await likeRef.get();
    if (!likeSnap.exists) {
      return NextResponse.json(
        { error: "좋아요하지 않은 리뷰입니다." },
        { status: 409 },
      );
    }

    await adminFirestore.runTransaction(async (transaction) => {
      transaction.delete(likeRef);
      transaction.update(reviewRef, {
        likeCount: FieldValue.increment(-1),
      });
      const userRef = adminFirestore.collection("users").doc(uid);
      transaction.update(userRef, {
        likedTicketsCount: FieldValue.increment(-1),
      });
    });

    const updatedReviewSnap = await reviewRef.get();
    const updatedLikeCount = updatedReviewSnap.data()?.likeCount || 0;

    revalidatePath("/ticket-list");
    revalidatePath("/my-page/liked-ticket-list");

    return NextResponse.json(
      {
        success: true,
        message: "좋아요가 취소되었습니다.",
        likeCount: updatedLikeCount,
        isLiked: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("좋아요 취소 실패:", error);
    return NextResponse.json(
      { error: "좋아요 취소에 실패했습니다." },
      { status: 500 },
    );
  }
}
