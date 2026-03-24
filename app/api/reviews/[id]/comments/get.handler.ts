import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";

// GET /api/reviews/[id]/comments - 특정 리뷰의 댓글 목록 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reviewId } = await params;

    const commentsCol = adminFirestore
      .collection("movie-reviews")
      .doc(reviewId)
      .collection("comments");

    const querySnapshot = await commentsCol.orderBy("createdAt", "asc").get();

    const commentsPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();

      // 댓글 작성자의 최신 프로필 정보 조회
      const authorInfo = {
        displayName: data.displayName || "익명",
        photoKey: data.photoKey || null,
        activityLevel: data.activityLevel || "NEWBIE",
      };

      try {
        // 'users' 컬렉션에서 댓글 작성자의 프로필 정보 조회
        const userRef = adminFirestore.collection("users").doc(data.authorId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          authorInfo.displayName =
            userData?.displayName || authorInfo.displayName;
          authorInfo.photoKey = userData?.photoKey || authorInfo.photoKey;
          authorInfo.activityLevel =
            userData?.activityLevel || authorInfo.activityLevel;
        }
      } catch (error) {
        console.warn(`사용자 ${data.authorId}의 프로필 조회 실패:`, error);
      }

      // 댓글 정보 반환 (댓글 내용 + 작성자 정보)
      return {
        id: doc.id,
        authorId: data.authorId,
        displayName: authorInfo.displayName,
        photoKey: authorInfo.photoKey,
        content: data.content,
        activityLevel: authorInfo.activityLevel,
        createdAt: data.createdAt?.toDate().toISOString() || null,
        updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    });

    const comments = await Promise.all(commentsPromises);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("댓글 조회 실패:", error);
    return NextResponse.json(
      { error: "댓글 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
