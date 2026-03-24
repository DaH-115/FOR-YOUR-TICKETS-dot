import { adminFirestore as db } from "firebase-admin-config";
import { verifyAuthToken } from "lib/auth/verifyToken";
import { NextRequest, NextResponse } from "next/server";

// POST /api/reviews/likes - 여러 리뷰에 대한 현재 사용자의 좋아요 여부(일괄 조회)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode },
      );
    }

    const { reviewIds } = (await req.json()) as { reviewIds: string[] };

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { error: "reviewIds must be a non-empty array" },
        { status: 400 },
      );
    }

    const uid = authResult.uid as string;

    const likesPromises = reviewIds.map(async (reviewId) => {
      const likeDoc = await db
        .collection("movie-reviews")
        .doc(reviewId)
        .collection("likedBy")
        .doc(uid)
        .get();
      const isLiked = likeDoc.exists;
      return { reviewId, isLiked };
    });

    const likesResults = await Promise.all(likesPromises);

    const likesMap = likesResults.reduce(
      (acc, { reviewId, isLiked }) => {
        acc[reviewId] = isLiked;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    return NextResponse.json({ likes: likesMap });
  } catch (error) {
    console.error("Error in POST /api/reviews/likes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
