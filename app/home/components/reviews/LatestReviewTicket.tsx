"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import MoviePoster from "@/components/movie/MoviePoster";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import formatDate from "@/utils/formatDate";

function LatestReviewTicket({ review }: { review: ReviewDoc }) {
  const { user, review: content } = review;
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // 리뷰 클릭 시 티켓 상세 페이지로 이동
  const handleReviewClick = useCallback(() => {
    setIsNavigating(true);
    router.push(`/ticket-list/${review.id}`);
  }, [router, review.id]);

  return (
    <article className="relative flex items-stretch shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* 영화 포스터 */}
      <MoviePoster
        posterPath={content.moviePosterPath || ""}
        title={content.movieTitle}
      />

      {/* 리뷰 컨텐츠 */}
      <section
        onClick={handleReviewClick}
        className="group flex h-full flex-1 cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100"
      >
        {isNavigating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black bg-opacity-30">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}

        {/* 프로필 이미지, 닉네임 */}
        <div className="flex flex-1 items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <ProfileAvatar
              s3photoKey={user?.photoKey || undefined}
              userDisplayName={user?.displayName || "사용자"}
              size={24}
            />
            <p className="truncate text-xs">{user?.displayName || "사용자"}</p>
          </div>
        </div>

        <div className="pb-4 pt-3">
          {/* 리뷰 제목 */}
          <h3 className="w-full truncate font-semibold">
            {`"${content.reviewTitle}"`}
          </h3>

          {/* 영화 타이틀 */}
          <p className="flex-1 truncate text-xs text-gray-500">
            {`${content.movieTitle}(${content.originalTitle})`}
          </p>
        </div>

        {/* 별점 & 인포 버튼 & 좋아요 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* 별점 */}
            <div className="flex items-center rounded-full border border-gray-300 px-2 py-1 text-xs">
              <FaStar className="text-accent-300" />
              <span className="ml-1 font-semibold text-gray-800">
                {content.rating}
              </span>
            </div>

            {/* 좋아요 */}
            <div className="flex items-center justify-center rounded-full border border-gray-300 px-2 py-1 text-xs">
              <FaHeart className="text-red-500" />
              <span className="ml-1 truncate text-gray-800">
                {content.likeCount}
              </span>
            </div>
          </div>

          {/* 작성 날짜 */}
          <p className="truncate text-right text-xs text-gray-500">
            {formatDate(content.createdAt, false)}
          </p>
        </div>
      </section>
    </article>
  );
}

export default memo(LatestReviewTicket);
