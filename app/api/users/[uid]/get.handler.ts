import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "firebase-admin-config";
import { verifyAuthToken, verifyResourceOwnership } from "lib/auth/verifyToken";
import { fetchUserReviewCount } from "lib/users/fetchUserReviewCount";

// GET /api/users/[uid] - 사용자 프로필 조회 (통계 정보 포함)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;

    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    // 본인 프로필만 조회 가능
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

    const userRef = adminFirestore.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const userData = userSnap.data();

    // 1. 내가 쓴 리뷰 개수 - DB에 저장된 값 우선 사용
    let myReviewsCount;
    if (userData?.reviewCount !== undefined) {
      myReviewsCount = userData.reviewCount;
    } else {
      myReviewsCount = await fetchUserReviewCount(uid);
    }

    // 2. 좋아요한 리뷰 개수 (컬렉션 그룹 쿼리 사용)
    const likesQuery = adminFirestore
      .collectionGroup("likedBy")
      .where("uid", "==", uid)
      .orderBy("createdAt", "desc");

    const likesSnapshot = await likesQuery.count().get();
    const likedReviewsCount = likesSnapshot.data().count;

    // 3. 응답 데이터 구성
    const responseData = {
      provider: userData?.provider,
      biography: userData?.biography,
      photoKey: userData?.photoKey,
      activityLevel: userData?.activityLevel,
      createdAt: userData?.createdAt?.toDate
        ? userData.createdAt.toDate().toISOString()
        : userData?.createdAt || null,
      updatedAt: userData?.updatedAt?.toDate
        ? userData.updatedAt.toDate().toISOString()
        : userData?.updatedAt || null,
      myTicketsCount: myReviewsCount,
      likedTicketsCount: likedReviewsCount,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("사용자 프로필 조회 실패:", error);
    return NextResponse.json(
      { error: "사용자 프로필 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
