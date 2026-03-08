import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import MoviePoster from "@/components/movie/MoviePoster";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";

interface ReviewTicketProps {
  review: ReviewDoc;
}

export default function ReviewTicket({ review }: ReviewTicketProps) {
  return (
    <article className="group relative flex cursor-pointer flex-col">
      {/* 별점 */}
      <div className="absolute top-0 right-0 left-0 z-20 flex items-center rounded-t-2xl bg-linear-to-b from-black/80 via-black/60 to-transparent px-3 pt-2 text-white">
        <FaStar className="text-accent-300" size={14} />
        <span className="ml-1 font-semibold">{review.review.rating}</span>
      </div>
      {/* 영화 포스터 */}
      <MoviePoster
        posterPath={review.review.moviePosterPath || ""}
        title={review.review.movieTitle}
      />
      {/* 정보 카드 */}
      <section className="flex h-[140px] flex-col rounded-2xl bg-white p-2">
        {/* 프로필 사진 & 닉네임 & 등급 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-1.5">
            <ProfileAvatar
              s3photoKey={review.user.photoKey || undefined}
              userDisplayName={review.user.displayName || "사용자"}
              size={24}
            />
            <p className="truncate text-xs">
              {review.user.displayName || "사용자"}
            </p>
          </div>
          <ActivityBadge activityLevel={review.user.activityLevel} />
        </div>
        {/* 리뷰 제목 */}
        <div className="px-1 py-3">
          <p className="line-clamp-2 text-sm leading-5">
            {`"${review.review.reviewTitle}"`}
          </p>
        </div>
        {/* 영화 타이틀 & 좋아요 */}
        <div className="mt-auto flex shrink-0 items-center justify-between border-t-4 border-dotted pt-1">
          <div className="flex-1 truncate pr-1.5 text-xs text-gray-500">
            {/* 영화 제목 및 연도 */}
            <span>
              {`${review.review.movieTitle} (${review.review.releaseYear})`}
            </span>
          </div>
          {/* 좋아요 버튼 */}
          <div className="flex items-center rounded-full border border-gray-300 px-2 py-1">
            <span className="text-sm text-red-500">
              {review.review.isLiked === undefined ? (
                // 미확정: 로딩 상태 느낌의 빈 하트
                <FaRegHeart />
              ) : review.review.isLiked ? (
                <FaHeart />
              ) : (
                <FaRegHeart />
              )}
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
