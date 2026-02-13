import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";

// DELETE /api/users/[uid] - 회원 탈퇴 (관련 데이터 전체 삭제)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;

    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const ownershipResult = verifyResourceOwnership(
      authResult.uid!,
      uid,
    );
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }
    const batch = adminFirestore.batch();

    // 1. 사용자가 작성한 모든 리뷰와 그 하위 데이터(댓글, 좋아요) 삭제
    const userReviewsQuery = adminFirestore
      .collection("movie-reviews")
      .where("user.uid", "==", uid);
    const userReviewsSnapshot = await userReviewsQuery.get();

    for (const reviewDoc of userReviewsSnapshot.docs) {
      // 리뷰 하위의 'comments' 컬렉션 삭제
      const commentsSnapshot = await reviewDoc.ref.collection("comments").get();
      commentsSnapshot.forEach((commentDoc) => batch.delete(commentDoc.ref));

      // 리뷰 하위의 'likedBy' 컬렉션 삭제
      const likedBySnapshot = await reviewDoc.ref.collection("likedBy").get();
      likedBySnapshot.forEach((likeDoc) => batch.delete(likeDoc.ref));

      // 메인 리뷰 문서 삭제
      batch.delete(reviewDoc.ref);
    }

    // 2. 사용자가 다른 사람의 리뷰에 남긴 '좋아요' 삭제 및 카운트 감소
    const userLikesQuery = adminFirestore
      .collectionGroup("likedBy")
      .where("uid", "==", uid);
    const userLikesSnapshot = await userLikesQuery.get();

    for (const likeDoc of userLikesSnapshot.docs) {
      const reviewRef = likeDoc.ref.parent.parent!;
      batch.delete(likeDoc.ref);
      batch.update(reviewRef, { likeCount: FieldValue.increment(-1) });
    }

    // 3. 사용자가 다른 사람의 리뷰에 남긴 '댓글' 삭제 및 카운트 감소
    const userCommentsQuery = adminFirestore
      .collectionGroup("comments")
      .where("authorId", "==", uid);
    const userCommentsSnapshot = await userCommentsQuery.get();

    for (const commentDoc of userCommentsSnapshot.docs) {
      const reviewRef = commentDoc.ref.parent.parent!;
      batch.delete(commentDoc.ref);
      batch.update(reviewRef, { commentsCount: FieldValue.increment(-1) });
    }

    // 4. 'users' 및 'usernames' 컬렉션에서 사용자 정보 삭제
    const userRef = adminFirestore.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      const displayName = userData?.displayName;

      batch.delete(userRef);

      if (displayName) {
        const usernameRef = adminFirestore
          .collection("usernames")
          .doc(displayName);
        batch.delete(usernameRef);
      }
    }

    // 5. 일괄 작업 실행
    await batch.commit();

    // 6. Firebase Auth에서 최종적으로 사용자 삭제
    await adminAuth.deleteUser(uid);

    return NextResponse.json({
      message: "회원 탈퇴가 성공적으로 처리되었습니다.",
    });
  } catch (error) {
    console.error("회원 탈퇴 처리 실패:", error);
    return NextResponse.json(
      { error: "회원 탈퇴 처리에 실패했습니다." },
      { status: 500 },
    );
  }
}
