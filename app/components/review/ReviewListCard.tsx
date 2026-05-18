"use client";

import ProfileAvatar from "@/components/user/ProfileAvatar";
import formatDate from "@/utils/formatDate";
import { FaStar } from "react-icons/fa";
import { ReviewDoc, ReviewUser } from "lib/reviews/fetchReviewsPaginated";

interface ReviewListCardProps {
  user: ReviewUser;
  reviews: ReviewDoc;
  handleReviewClick: () => void;
}

export default function ReviewListCard({
  user,
  reviews,
  handleReviewClick,
}: ReviewListCardProps) {
  const {
    movieTitle,
    originalTitle,
    releaseYear,
    reviewTitle,
    createdAt,
    rating,
  } = reviews.review;

  return (
    <article onClick={handleReviewClick} className="mx-auto w-full max-w-md">
      <div className="flex h-56 cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-4 transition-colors duration-300 ease-in-out hover:bg-gray-100">
        {/* 제목 (2줄까지, 초과 시 말줄임) */}
        <div className="mb-3 shrink-0">
          <h1 className="line-clamp-2 text-sm leading-tight font-bold">
            {movieTitle}
          </h1>
          <p className="line-clamp-1 text-xs tracking-tight text-gray-400">
            {`${originalTitle} (${releaseYear})`}
          </p>
        </div>

        {/* 유저 */}
        <div className="mb-2 flex min-w-0 shrink-0 items-center gap-2">
          <ProfileAvatar
            s3photoKey={user.photoKey}
            userDisplayName={user.displayName || ""}
            size={24}
          />
          <p className="min-w-0 truncate text-xs tracking-tight text-gray-800">
            {user.displayName || ""}
          </p>
        </div>

        {/* 리뷰 타이틀 (남는 높이 안에서 최대 4줄) */}
        <div className="flex min-h-0 flex-1 flex-col pt-2">
          <h2 className="text-md line-clamp-4 leading-snug font-semibold tracking-tight">
            {`"${reviewTitle}"`}
          </h2>
        </div>
        {/* 꾸밈요소 (선택·드래그 방지) */}
        <div className="shrink-0 text-sm font-bold tracking-tight whitespace-nowrap text-gray-200 select-none">
          {"For your Ticket."}
        </div>

        {/* 하단 컨텐츠 */}
        <div className="mt-auto flex shrink-0 items-center justify-between gap-2">
          {/* 날짜(시간 제외) */}
          <div className="text-right text-xs tracking-tight whitespace-nowrap text-gray-400">
            {formatDate(createdAt, false)}
          </div>
          {/* 리뷰 평점 */}
          <div className="flex items-center gap-1">
            <FaStar className="text-accent-300 text-lg" />
            <p className="text-lg font-bold">{rating}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
