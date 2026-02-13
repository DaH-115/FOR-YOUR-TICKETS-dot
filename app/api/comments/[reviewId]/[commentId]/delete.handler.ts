import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";

// DELETE /api/comments/[reviewId]/[commentId] - 댓글 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string; commentId: string }> },
) {
  try {
    const { reviewId, commentId } = await params;

    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    // Firestore 트랜잭션을 사용하여 댓글 삭제와 카운트 업데이트를 원자적으로 처리
    const reviewRef = adminFirestore
      .collection("movie-reviews")
      .doc(reviewId);
    const commentRef = reviewRef.collection("comments").doc(commentId);

    await adminFirestore.runTransaction(async (transaction) => {
      // 댓글 문서가 존재하는지 확인
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists) {
        // 트랜잭션 내에서 특정 상태 코드를 반환하기 위해 커스텀 에러 사용
        throw Object.assign(new Error("댓글을 찾을 수 없습니다."), {
          statusCode: 404,
        });
      }

      // 댓글 작성자 권한 확인
      const commentData = commentDoc.data();
      const ownershipResult = verifyResourceOwnership(
        authResult.uid!,
        commentData!.authorId,
      );
      if (!ownershipResult.success) {
        // 트랜잭션 내에서 특정 상태 코드를 반환하기 위해 커스텀 에러 사용
        throw Object.assign(new Error("접근 권한이 없습니다."), {
          statusCode: 403,
        });
      }

      // 메인 댓글 문서 삭제
      transaction.delete(commentRef);

      // 리뷰의 댓글 수 감소
      transaction.update(reviewRef, {
        commentsCount: FieldValue.increment(-1),
      });
    });

    // 사용자 활동 등급 업데이트
    try {
      await updateUserActivityLevel(authResult.uid!);
    } catch (error) {
      console.error("사용자 등급 업데이트 실패:", error);
      // 등급 업데이트 실패는 댓글 삭제에 영향을 주지 않음
    }

    // 캐시 재검증
    revalidatePath("/ticket-list");

    return NextResponse.json(
      {
        success: true,
        message: "댓글이 성공적으로 삭제되었습니다.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    // 트랜잭션에서 던져진 커스텀 에러 처리
    if (error instanceof Error && "statusCode" in error) {
      const statusCode = (error as { statusCode: unknown }).statusCode;
      if (statusCode === 403 || statusCode === 404) {
        return NextResponse.json(
          { error: error.message },
          { status: statusCode },
        );
      }
    }
    return NextResponse.json(
      { error: "댓글 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
