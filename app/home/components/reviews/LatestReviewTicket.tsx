"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import MoviePoster from "app/components/movie/MoviePoster";
import ProfileAvatar from "app/components/user/ProfileAvatar";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import formatDate from "app/utils/formatDate";
import { IoInformationCircle } from "react-icons/io5";

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
    <article className="flex items-stretch shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* 영화 포스터 */}
      <div className="aspect-[2/3] h-full transform-gpu overflow-hidden rounded-xl">
        <MoviePoster
          posterPath={content.moviePosterPath}
          title={content.movieTitle}
          lazy
        />
      </div>

      {/* 리뷰 컨텐츠 */}
      <section
        onClick={handleReviewClick}
        className="group flex h-full flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border-l-8 border-dotted border-gray-300 bg-white p-3 hover:bg-gray-100 lg:border-l-4"
      >
        {isNavigating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-l-xl bg-black bg-opacity-30">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}

        {/* 별점 & 인포 버튼 & 좋아요 */}
        <header className="mb-2 flex items-center justify-between gap-2">
          {/* 별점 */}
          <div className="flex items-center">
            <FaStar className="text-accent-300" size={16} />
            <span className="ml-1 font-bold">{content.rating}</span>
          </div>

          {/* 인포 버튼 */}
          <div className="flex items-center gap-1.5">
            <IoInformationCircle
              className="text-xl text-gray-300 transition-colors duration-300 group-hover:text-gray-500"
              aria-hidden
            />

            {/* 좋아요 */}
            <div className="flex items-center justify-center text-sm">
              <FaHeart className="text-red-500" />
              <div className="ml-1 truncate">{content.likeCount}</div>
            </div>
          </div>
        </header>

        {/* 리뷰 제목 */}
        <h3 className="w-full truncate font-semibold">
          {`"${content.reviewTitle}"`}
        </h3>

        {/* 영화 타이틀 */}
        <p className="mb-4 flex-1 truncate pr-1 text-xs text-gray-500">
          {`${content.movieTitle}(${content.originalTitle})`}
        </p>

        {/* 프로필 이미지, 닉네임 */}
        <footer className="flex flex-1 items-center justify-between gap-1.5 border-t-4 border-dotted pt-2">
          <div className="flex items-center gap-1.5">
            <ProfileAvatar
              s3photoKey={user?.photoKey || undefined}
              userDisplayName={user?.displayName || "사용자"}
              size={24}
              isPublic
            />
            <p className="truncate text-xs">{user?.displayName || "사용자"}</p>
          </div>

          {/* 작성 날짜 */}
          <p className="truncate text-right text-xs text-gray-500">
            {formatDate(content.createdAt, false)}
          </p>
        </footer>
      </section>
    </article>
  );
}

export default memo(LatestReviewTicket);
