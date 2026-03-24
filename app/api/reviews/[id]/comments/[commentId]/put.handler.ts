import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";

// PUT /api/reviews/[id]/comments/[commentId] - 댓글 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id: reviewId, commentId } = await params;

    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const { content } = await req.json();

    // 필수 필드 검증
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "content가 필요합니다." },
        { status: 400 },
      );
    }

    const commentRef = adminFirestore
      .collection("movie-reviews")
      .doc(reviewId)
      .collection("comments")
      .doc(commentId);

    // 댓글 존재 확인
    const commentSnap = await commentRef.get();
    if (!commentSnap.exists) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 댓글 작성자 권한 확인
    const commentData = commentSnap.data();
    const ownershipResult = verifyResourceOwnership(
      authResult.uid!,
      commentData!.authorId,
    );
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    // 댓글 수정
    await commentRef.update({
      content: content.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 캐시 재검증
    revalidatePath("/ticket-list");

    return NextResponse.json({
      success: true,
      message: "댓글이 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    return NextResponse.json(
      { error: "댓글 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}
