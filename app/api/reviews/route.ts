import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { updateCommentsActivityLevel } from "@/api/users/[uid]/route.helper";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";
import { updateUserActivityLevel } from "lib/users/updateUserActivityLevel";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const uid = searchParams.get("uid") ?? undefined;
  const search = searchParams.get("search") ?? "";

  const data = await fetchReviewsPaginated({ page, pageSize, uid, search });
  return NextResponse.json(data);
}

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

    // 사용자 등급 업데이트 (백그라운드에서 실행, API 응답을 기다리지 않음)
    (async () => {
      try {
        const newActivityLevel = await updateUserActivityLevel(
          reviewData.user.uid,
        );

        // 댓글의 활동 등급도 업데이트 (새 등급이 있는 경우)
        if (newActivityLevel) {
          await updateCommentsActivityLevel(
            reviewData.user.uid,
            newActivityLevel,
          );
        }
      } catch (error) {
        console.error(
          `리뷰 생성 후 사용자 등급 업데이트 실패 (uid: ${reviewData.user.uid}):`,
          error,
        );
        // 등급 업데이트 실패는 리뷰 생성에 영향을 주지 않음
      }
    })();

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
