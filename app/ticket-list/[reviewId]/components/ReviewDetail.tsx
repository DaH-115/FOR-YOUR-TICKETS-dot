"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import formatDate from "@/utils/formatDate";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import CommentList from "@/components/review/comment/CommentList";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useAlert } from "store/context/alertContext";
import { isAuth } from "firebase-config";
import MoviePoster from "@/components/movie/MoviePoster";
import Tooltip from "@/components/ui/feedback/Tooltip";
import { getAuthHeaders, waitForAuthReady } from "@/utils/getIdToken";

interface ReviewDetailProps {
  review: ReviewDoc;
  reviewId: string;
}

export default function ReviewDetail({ review, reviewId }: ReviewDetailProps) {
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);
  const { showSuccessHandler, showErrorHandler, showConfirmHandler } =
    useAlert();

  const { user, review: content } = review;

  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(content.isLiked);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 본인 리뷰인지 확인
  const isOwnReview = currentUser?.uid === user.uid;

  // Redux store 기반 로그인 상태 (Auth 초기화 후에도 반응적으로 업데이트)
  const isLoggedIn = !!currentUser?.uid;

  // 마운트 시 좋아요 상태 동기화
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        // Firebase Auth 초기화 완료 대기
        await waitForAuthReady();

        // 로그인하지 않은 경우 서버 동기화 불필요
        if (!isAuth.currentUser || isCancelled) return;

        // 인증 헤더 생성 후 like-statuses API 호출
        const authHeaders = await getAuthHeaders();
        const response = await fetch("/api/reviews/like-statuses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ reviewIds: [reviewId] }),
        });

        if (!response.ok) return; // 실패 시 조용히 무시 (UX 유지)

        const data = (await response.json()) as {
          likes: Record<string, boolean>;
        };

        if (!isCancelled && data?.likes && reviewId in data.likes) {
          setIsLiked(data.likes[reviewId]);
        }
      } catch {
        // 네트워크/인증 오류는 초기 렌더 UX를 해치지 않기 위해 무시
      }
    })();

    return () => {
      isCancelled = true;
    };
    // 리뷰 ID 또는 로그인 상태가 바뀌면 재동기화
  }, [reviewId, isLoggedIn]);

  // 좋아요 토글 핸들러
  const likeToggleHandler = useCallback(async () => {
    if (!isAuth.currentUser || isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const authHeaders = await getAuthHeaders();

      const requestOptions: RequestInit = {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      };

      if (!isLiked) {
        requestOptions.body = JSON.stringify({
          movieTitle: content.movieTitle,
        });
      }

      const response = await fetch(
        `/api/reviews/${reviewId}/like`,
        requestOptions,
      );

      const text = await response.text();
      let data: { isLiked: boolean; likeCount: number; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("서버 응답을 처리할 수 없습니다.");
      }

      if (response.ok) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } else {
        throw new Error(data.error || "좋아요 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      showErrorHandler(
        "오류",
        error instanceof Error
          ? error.message
          : "좋아요 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLikeLoading(false);
    }
  }, [reviewId, isLiked, isLikeLoading, content.movieTitle, showErrorHandler]);

  // 리뷰 수정 핸들러
  const editHandler = useCallback(() => {
    router.push(`/write-review/${reviewId}?movieId=${content.movieId}`);
  }, [router, reviewId, content.movieId]);

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
    <main className="3xl:max-w-[1600px] mx-8 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 별점, 제목, 영화 정보, 좋아요 버튼 */}
      <header className="mb-4">
        <div className="mr-4 mb-2 flex items-center text-3xl">
          <FaStar className="text-accent-300 mr-1" />
          <p className="font-bold text-white">{content.rating}</p>
        </div>

        <h3 className="text-4xl font-bold text-white">{content.reviewTitle}</h3>

        <div className="text-gray-400">
          <Link
            href={`/movie-details/${content.movieId}`}
            className="transition-colors duration-150 hover:text-gray-200"
          >
            {`${content.movieTitle}(${content.releaseYear})`}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-md">
        {/* 영화 포스터 */}
        <MoviePoster
          posterPath={content.moviePosterPath || ""}
          title={content.movieTitle}
        />
      </div>

      {/* 리뷰 정보 */}
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          {/* 리뷰 번호 */}
          {review.orderNumber && (
            <p className="mb-2 text-xs text-gray-400">
              Review #{review.orderNumber}
            </p>
          )}

          {/* 좋아요 버튼 */}
          {!isLoggedIn ? (
            <Tooltip content="로그인 후 좋아요를 누를 수 있습니다">
              <button
                disabled
                className="flex cursor-not-allowed items-center text-red-500 opacity-50"
              >
                <FaRegHeart size={14} />
                <p className="ml-1">{likeCount}</p>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={likeToggleHandler}
              disabled={isLikeLoading}
              className="flex cursor-pointer items-center rounded-full text-red-500 transition-colors hover:text-red-400 disabled:opacity-50"
            >
              {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
              <p className="ml-1">{likeCount}</p>
            </button>
          )}
        </div>
        {/* 프로필, 닉네임, 등급, 수정/삭제 버튼(본인만) */}
        <div className="mb-6 flex items-center justify-between">
          {/* 프로필, 닉네임, 등급 */}
          <div className="flex items-center gap-2">
            <ProfileAvatar
              s3photoKey={user.photoKey || undefined}
              userDisplayName={user.displayName || "사용자"}
              size={24}
            />
            <p className="min-w-0 truncate text-sm">
              {user.displayName || "사용자"}
            </p>
            <ActivityBadge activityLevel={user.activityLevel} />
          </div>

          {/* 수정/삭제 버튼(본인만) */}
          {isOwnReview && (
            <div className="flex items-center gap-2">
              {/* 수정 버튼 */}
              <button
                onClick={editHandler}
                className="group flex cursor-pointer items-center transition-colors duration-100"
                title="리뷰 수정"
                type="button"
              >
                <span className="text-xs text-gray-600">수정</span>
              </button>
              {/* 삭제 버튼 */}
              <button
                onClick={deleteHandler}
                className="group flex cursor-pointer items-center transition-colors duration-100"
                title="리뷰 삭제"
                type="button"
              >
                <span className="text-xs text-gray-600">삭제</span>
              </button>
            </div>
          )}
        </div>

        {/* 리뷰 본문 */}
        <div className="mb-2 rounded-lg bg-gray-50 p-4">
          <p className="text-sm leading-relaxed break-keep text-gray-800">
            {content.reviewContent}
          </p>
        </div>

        {/* 작성일 */}
        <div className="text-right text-xs text-gray-400">
          {formatDate(content.createdAt)}
        </div>
      </div>

      {/* 댓글 리스트 */}
      <CommentList id={reviewId} reviewAuthorId={user.uid || ""} />
    </main>
  );
}
