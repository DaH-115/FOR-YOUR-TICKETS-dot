import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";

// DELETE /api/reviews/[id] - 리뷰 삭제
export async function DELETE(
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

    // Firestore 일괄 쓰기(Batch) 생성
    const batch = adminFirestore.batch();

    // 1. 하위 컬렉션 'comments'의 모든 문서 삭제
    const commentsSnapshot = await reviewRef.collection("comments").get();
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 2. 하위 컬렉션 'likedBy'의 모든 문서 삭제
    const likedBySnapshot = await reviewRef.collection("likedBy").get();
    likedBySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. 메인 리뷰 문서 삭제
    batch.delete(reviewRef);

    // 일괄 쓰기 실행
    await batch.commit();

    // 리뷰 삭제 후에 사용자 UID를 사용하여 등급 업데이트
    const userUid = reviewData!.user.uid;
    try {
      // reviewCount를 -1 감소시키고 등급 계산
      await updateUserActivityLevel(userUid, -1); // 리뷰 삭제 시 -1
    } catch (error) {
      console.error("사용자 등급 업데이트 실패:", error);
      // 등급 업데이트 실패는 리뷰 삭제에 영향을 주지 않음
    }

    // 캐시 재검증
    revalidatePath("/ticket-list");
    revalidatePath("/my-page/my-ticket-list");
    revalidatePath("/my-page/liked-ticket-list");
    revalidatePath("/");
    revalidateTag("reviews");

    return NextResponse.json(
      {
        success: true,
        message: "리뷰가 성공적으로 삭제되었습니다.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("리뷰 삭제 실패:", error);
    return NextResponse.json(
      { error: "리뷰 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
