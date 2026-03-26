"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useAlert } from "store/context/alertContext";
import { ReviewDoc, ReviewUser } from "types/review";
import formatDate from "@/utils/formatDate";
import { getAuthHeaders } from "@/utils/getIdToken";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import ReviewDetailCardComment from "@/components/review/ReviewDetailCardComment";
import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import ReviewDetailLike from "@/components/review/ReviewDetailLike";

interface ReviewDetailCardContentProps {
  review: ReviewDoc;
  user: ReviewUser;
}

export default function ReviewDetailCardContent({
  review,
  user,
}: ReviewDetailCardContentProps) {
  const router = useRouter();
  const { reviewContent, createdAt } = review.review;
  const currentUser = useAppSelector(selectUser);
  // 본인 리뷰인지 확인
  const isOwnReview = currentUser?.uid === user.uid;
  const reviewId = review.id;
  const { movieId } = review.review;
  const { showConfirmHandler, showSuccessHandler, showErrorHandler } =
    useAlert();

  // 리뷰 수정 확인 후 이동
  const executeEdit = useCallback(() => {
    router.push(`/write-review/${reviewId}?movieId=${movieId}`);
  }, [router, reviewId, movieId]);

  // 리뷰 수정 핸들러 (확인 모달 사용)
  const editHandler = useCallback(() => {
    showConfirmHandler("리뷰 수정", "이 리뷰를 수정하시겠습니까?", executeEdit);
  }, [showConfirmHandler, executeEdit]);

  // 실제 삭제 요청 처리
  const executeDelete = useCallback(async () => {
    try {
      const authHeaders = await getAuthHeaders();

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          ...authHeaders,
        },
      });

      const text = await response.text();
      let data: { error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }

      if (response.ok) {
        showSuccessHandler("삭제 완료", "리뷰가 삭제되었습니다.", () => {
          router.push("/ticket-list");
        });
      } else {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      showErrorHandler(
        "오류",
        error instanceof Error
          ? error.message
          : "리뷰 삭제 중 오류가 발생했습니다.",
      );
    }
  }, [reviewId, showSuccessHandler, showErrorHandler, router]);

  // 리뷰 삭제 핸들러 (커스텀 confirm 모달 사용)
  const deleteHandler = useCallback(() => {
    showConfirmHandler(
      "리뷰 삭제",
      "정말로 이 리뷰를 삭제하시겠습니까?",
      executeDelete,
    );
  }, [showConfirmHandler, executeDelete]);

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-t-2xl bg-white px-8 py-6">
        <div className="mb-8 flex items-center justify-between gap-2">
          {/* 라벨 */}
          <p className="text-sm font-bold tracking-tight text-gray-800">
            {"Review."}
          </p>
          <ReviewDetailLike
            reviewId={reviewId}
            initialIsLiked={review.review.isLiked ?? false}
            initialLikeCount={review.review.likeCount}
          />
        </div>

        {/* 유저  */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ProfileAvatar
              s3photoKey={user.photoKey}
              userDisplayName={user.displayName || ""}
              size={24}
            />
            <p className="text-sm font-semibold tracking-tight text-gray-800">
              {user.displayName}
            </p>
            <ActivityBadge activityLevel={user.activityLevel} />
          </div>

          {isOwnReview && (
            <div className="flex items-center gap-2 text-xs">
              <button
                className="p-2 text-gray-600 hover:text-gray-800"
                onClick={editHandler}
              >
                수정
              </button>
              <button
                className="p-2 text-gray-600 hover:text-red-800"
                onClick={deleteHandler}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 리뷰 내용 (줄바꿈·빈줄 보존) */}
        <p className="pt-8 pb-12 text-sm tracking-tight whitespace-pre-line">
          {reviewContent}
        </p>

        {/* 날짜 (시간 제외) */}
        <p className="text-left text-xs tracking-tight text-gray-400">
          {formatDate(createdAt, false)}
        </p>
      </div>
      <ReviewDetailCardComment review={review} />
    </section>
  );
}
