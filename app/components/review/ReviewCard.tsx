"use client";

import ProfileAvatar from "@/components/user/ProfileAvatar";
import formatDate from "@/utils/formatDate";
import { FaStar } from "react-icons/fa";
import { ReviewDoc, ReviewUser } from "lib/reviews/fetchReviewsPaginated";

interface ReviewCardProps {
  user: ReviewUser;
  reviews: ReviewDoc;
  handleReviewClick: () => void;
}

export default function ReviewCard({
  user,
  reviews,
  handleReviewClick,
}: ReviewCardProps) {
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
      <div className="cursor-pointer rounded-2xl bg-white px-8 py-6 transition-colors duration-300 ease-in-out hover:bg-gray-100">
        {/* 제목 & 원제목 & 개봉년도 */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{movieTitle}</h1>
            <p className="text-sm tracking-tight text-gray-400">{`${originalTitle} (${releaseYear})`}</p>
          </div>

          {/* 전역 순번(문서 orderNumber) */}
          {typeof reviews.orderNumber === "number" && (
            <div className="bg-gray-200 px-2 py-1">
              <p className="text-xs font-bold tracking-tight text-gray-600">
                No.{reviews.orderNumber}
              </p>
            </div>
          )}
        </div>

        {/* 유저  */}
        <div className="flex items-center gap-2">
          <ProfileAvatar
            s3photoKey={user.photoKey}
            userDisplayName={user.displayName || ""}
            size={32}
          />
          <p className="text-sm font-semibold tracking-tight text-gray-800">
            {user.displayName || ""}
          </p>
        </div>

        {/* 리뷰 타이틀 */}
        <h2 className="pt-8 pb-12 text-xl font-semibold tracking-tight">
          &quot;{reviewTitle}&quot;
        </h2>
        {/* 꾸밈요소 (선택·드래그 방지) */}
        <div className="text-md font-extrabold tracking-tight whitespace-nowrap text-gray-300 select-none">
          For your Ticket.
        </div>

        {/* 하단 컨텐츠 */}
        <div className="flex items-center justify-between gap-2">
          {/* 날짜 (시간 제외) */}
          <div className="text-right text-xs tracking-tight whitespace-nowrap text-gray-400">
            {formatDate(createdAt, false)}
          </div>
          {/* 리뷰 평점 */}
          <div className="flex items-center gap-1">
            <FaStar className="text-accent-300 text-xl" />
            <p className="text-xl font-bold">{rating}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
