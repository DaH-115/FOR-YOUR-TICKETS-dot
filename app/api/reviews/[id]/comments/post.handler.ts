import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";

// POST /api/reviews/[id]/comments - 댓글 생성
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reviewId } = await params;

    // 1. Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }
    const uid = authResult.uid!;

    // 2. 요청 본문에서 댓글 작성자 ID와 내용 추출
    const { authorId, content } = await req.json();

    // 3. 필수 필드 검증
    if (!authorId || !content?.trim()) {
      return NextResponse.json(
        { error: "authorId와 content가 필요합니다." },
        { status: 400 },
      );
    }

    // 4. 리소스 소유자 권한 확인
    const ownershipResult = verifyResourceOwnership(uid, authorId);
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    // 5. 서버 측에서 인증된 사용자의 정보 조회
    let displayName = "익명";
    let photoKey = null;
    let activityLevel = "NEWBIE";

    try {
      const userSnap = await adminFirestore.collection("users").doc(uid).get();
      if (userSnap.exists) {
        const userData = userSnap.data();
        displayName = userData?.displayName || "익명";
        photoKey = userData?.photoKey || null;
        activityLevel = userData?.activityLevel || "NEWBIE";
      } else {
        const authUser = await adminAuth.getUser(uid);
        displayName = authUser.displayName || "익명";
      }
    } catch (error) {
      console.warn(`댓글 생성 시 사용자 정보(uid: ${uid}) 조회 실패:`, error);
    }

    // Firestore 트랜잭션을 사용하여 댓글 추가와 카운트 업데이트를 원자적으로 처리
    const reviewRef = adminFirestore
      .collection("movie-reviews")
      .doc(reviewId);
    const commentCollectionRef = reviewRef.collection("comments");

    const newCommentRef = await adminFirestore.runTransaction(
      async (transaction) => {
        // 리뷰 문서가 존재하는지 확인
        const reviewDoc = await transaction.get(reviewRef);
        if (!reviewDoc.exists) {
          throw new Error("리뷰를 찾을 수 없습니다.");
        }

        const newComment = {
          authorId,
          displayName,
          photoKey,
          activityLevel,
          content: content.trim(),
          createdAt: FieldValue.serverTimestamp(),
        };

        // 새 댓글 문서 참조 생성 후 데이터 저장
        const tempCommentRef = commentCollectionRef.doc();
        transaction.set(tempCommentRef, newComment);

        // 리뷰 문서의 댓글 수 업데이트
        transaction.update(reviewRef, {
          commentsCount: FieldValue.increment(1),
        });

        return tempCommentRef;
      },
    );

    // 6. 사용자 활동 등급 업데이트
    try {
      await updateUserActivityLevel(uid);
    } catch (error) {
      console.error("사용자 등급 업데이트 실패:", error);
      // 등급 업데이트 실패는 댓글 생성에 영향을 주지 않음
    }

    // 7. 캐시 재검증
    revalidatePath("/ticket-list");

    return NextResponse.json(
      {
        success: true,
        id: newCommentRef.id,
        message: "댓글이 성공적으로 등록되었습니다.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("댓글 생성 실패:", error);
    return NextResponse.json(
      { error: "comment/create-failed" },
      { status: 500 },
    );
  }
}
