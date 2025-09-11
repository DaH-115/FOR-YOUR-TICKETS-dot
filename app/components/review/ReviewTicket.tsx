"use client";

import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import ActivityBadge from "app/components/ui/feedback/ActivityBadge";
import MoviePoster from "app/components/movie/MoviePoster";
import ProfileAvatar from "app/components/user/ProfileAvatar";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";

interface ReviewTicketProps {
  review: ReviewDoc;
}

export default function ReviewTicket({ review }: ReviewTicketProps) {
  return (
    <article className="group relative flex cursor-pointer flex-col items-stretch drop-shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
      {/* 프로필 사진 & 닉네임 & 등급 */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between rounded-t-xl bg-gradient-to-b from-black/80 via-black/60 to-transparent px-3 pt-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <ProfileAvatar
            s3photoKey={review.user.photoKey || undefined}
            userDisplayName={review.user.displayName || "사용자"}
            size={24}
            isPublic
          />
          <p className="min-w-0 truncate text-xs font-medium text-white">
            {review.user.displayName || "사용자"}
          </p>
        </div>
        <ActivityBadge activityLevel={review.user.activityLevel} size="tiny" />
      </div>
      {/* 포스터 이미지 */}
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl">
        <MoviePoster
          posterPath={review.review.moviePosterPath}
          title={review.review.movieTitle}
        />
      </div>
      {/* 정보 카드 - 고정 높이 설정 */}
      <section className="relative z-10 flex h-32 flex-col rounded-xl border bg-white p-3 pt-2 text-black transition-colors duration-200 group-hover:bg-gray-200">
        {/* 별점 */}
        <div className="flex items-center">
          <FaStar className="text-accent-300" size={16} />
          <span className="ml-1 font-bold">{review.review.rating}</span>
        </div>
        {/* 리뷰 제목 */}
        <div className="flex-1 py-2">
          <p className="line-clamp-2 text-sm font-semibold leading-5">
            {`"${review.review.reviewTitle}"`}
          </p>
        </div>
        {/* 영화 타이틀 & 좋아요 */}
        <div className="mt-auto flex items-center justify-between border-t-4 border-dotted pt-1.5">
          <div className="flex-1 truncate pr-1.5 text-xs text-gray-500">
            {/* 영화 제목 및 연도 */}
            <span>
              {`${review.review.movieTitle} (${review.review.releaseYear})`}
            </span>
          </div>
          {/* 좋아요 버튼 */}
          <div className="flex items-center">
            <span className="text-red-500 transition-transform duration-200 group-hover:scale-110">
              {review.review.isLiked ? <FaHeart /> : <FaRegHeart />}
            </span>
            <span className="ml-1 text-center text-sm">
              {review.review.likeCount}
            </span>
          </div>
        </div>
      </section>
    </article>
  );
}
