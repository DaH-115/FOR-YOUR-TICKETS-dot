"use client";

import ProfileAvatar from "@/components/user/ProfileAvatar";
import formatDate from "@/utils/formatDate";
import { FaStar } from "react-icons/fa";
import { ReviewDoc, ReviewUser } from "lib/reviews/fetchReviewsPaginated";
import ReviewPhotoGrid from "@/components/review/ReviewPhotoGrid";

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
    photoKeys,
  } = reviews.review;
  const hasPhotos = Boolean(photoKeys?.length);

  return (
    <article
      onClick={handleReviewClick}
      className="mx-auto h-full w-full max-w-md"
    >
      <div
        className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white px-6 py-5 transition-colors duration-300 ease-in-out hover:bg-gray-100 ${
          hasPhotos ? "h-104" : "h-72"
        }`}
      >
        {/* 제목 & 원제목 & 개봉년도 */}
        <div className="mb-2 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="line-clamp-2 text-lg leading-tight font-bold">
              {movieTitle}
            </h1>
            <p className="line-clamp-1 text-sm tracking-tight text-gray-400">{`${originalTitle} (${releaseYear})`}</p>
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
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <ProfileAvatar
            s3photoKey={user.photoKey}
            userDisplayName={user.displayName || ""}
            size={32}
          />
          <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-gray-800">
            {user.displayName || ""}
          </p>
        </div>

        {/* 리뷰 타이틀 */}
        <h2 className="line-clamp-3 shrink-0 pt-5 pb-4 text-xl leading-snug font-semibold tracking-tight">
          &quot;{reviewTitle}&quot;
        </h2>

        <ReviewPhotoGrid photoKeys={photoKeys?.slice(0, 2)} compact />

        {/* 꾸밈요소 (선택·드래그 방지) */}
        <div className="text-md mt-auto shrink-0 font-extrabold tracking-tight whitespace-nowrap text-gray-300 select-none">
          For your Ticket.
        </div>

        {/* 하단 컨텐츠 */}
        <div className="flex shrink-0 items-center justify-between gap-2">
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
