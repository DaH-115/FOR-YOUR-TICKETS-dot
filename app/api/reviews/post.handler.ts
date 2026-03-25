import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { computeGlobalReviewOrderNumber } from "lib/reviews/computeGlobalReviewOrderNumber";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";

// POST /api/reviews - 리뷰 생성
export async function POST(req: NextRequest) {
  try {
    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const reviewData = await req.json();

    // 필수 필드 검증
    if (!reviewData.user || !reviewData.review) {
      return NextResponse.json(
        { error: "user와 review 데이터가 필요합니다." },
        { status: 400 },
      );
    }

    // 리소스 소유자 권한 확인
    const ownershipResult = verifyResourceOwnership(
      authResult.uid!,
      reviewData.user.uid,
    );
    if (!ownershipResult.success) {
      return NextResponse.json(
        { error: ownershipResult.error },
        { status: ownershipResult.statusCode || 403 },
      );
    }

    // Firestore에 리뷰 생성
    const newReview = {
      user: reviewData.user,
      review: {
        ...reviewData.review,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        likeCount: 0,
      },
    };

    const docRef = await adminFirestore
      .collection("movie-reviews")
      .add(newReview);

    try {
      const createdSnap = await docRef.get();
      const createdAt = createdSnap.get("review.createdAt") as Timestamp | undefined;
      if (createdAt && typeof createdAt.toDate === "function") {
        const orderNumber = await computeGlobalReviewOrderNumber(createdAt);
        await docRef.update({ orderNumber });
      }
    } catch (orderErr) {
      // 순번 기록 실패해도 리뷰 생성은 유효 — 상세/목록에서 계산·역산으로 보완
      console.error("리뷰 순번(orderNumber) 기록 실패:", orderErr);
    }

    try {
      // reviewCount를 +1 증가시키고 등급 계산
      // 댓글의 비정규화된 activityLevel은 조회 시 users 컬렉션에서
      // 최신 데이터로 교체되므로 별도 배치 업데이트가 불필요합니다.
      await updateUserActivityLevel(
        reviewData.user.uid,
        1, // 리뷰 작성 시 +1
      );
    } catch (error) {
      // 등급 업데이트 실패는 리뷰 생성에 영향을 주지 않음
      console.error(
        `리뷰 생성 후 사용자 등급 업데이트 실패 (uid: ${reviewData.user.uid}):`,
        error,
      );
    }

    // 캐시 재검증
    revalidatePath("/ticket-list");
    revalidatePath("/"); // 홈페이지도 재검증
    revalidateTag("reviews"); // 리뷰 관련 모든 캐시 무효화

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        message: "리뷰가 성공적으로 생성되었습니다.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("리뷰 생성 실패:", error);
    return NextResponse.json(
      { error: "리뷰 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
