"use client";

import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { ReviewDoc, ReviewUser } from "types";
import ReviewDetailCardContent from "@/components/review/ReviewDetailCardContent";

interface ReviewDetailCardProps {
  review: ReviewDoc;
  user: ReviewUser;
}

export default function ReviewDetailCard({
  review,
  user,
}: ReviewDetailCardProps) {
  const {
    movieId,
    movieTitle,
    originalTitle,
    releaseYear,
    reviewTitle,
    rating,
  } = review.review;

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border-b-2 border-dashed bg-white px-8 py-6">
        {/* 제목 & 원제목 & 개봉년도 */}
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/movie-details/${movieId}`}>
            <h1 className="text-xl font-bold">{movieTitle}</h1>
            <p className="text-lg tracking-tight text-gray-400">{`${originalTitle} (${releaseYear})`}</p>
          </Link>

          {/* 전역 순번(문서에 없으면 미표시; 상세 조회 시 서버에서 계산될 수 있음) */}
          {typeof review.orderNumber === "number" && (
            <div className="bg-gray-200 px-2 py-1">
              <p className="text-xs font-bold tracking-tight text-gray-600">
                {`No.${review.orderNumber}`}
              </p>
            </div>
          )}
        </div>

        {/* 리뷰 타이틀 */}
        <h2 className="pt-8 pb-12 text-2xl font-semibold tracking-tight">
          &quot;{reviewTitle}&quot;
        </h2>

        {/* 하단 컨텐츠 */}
        <div className="flex items-end justify-between">
          {/* 리뷰 평점 */}
          <div className="flex items-center gap-1">
            <FaStar className="text-accent-300" />
            <p className="text-2xl font-bold">{rating}</p>
          </div>
          {/* 꾸밈요소 (선택·드래그 방지) */}
          <div className="text-md font-extrabold tracking-tight text-gray-300 select-none">
            For your Ticket.
          </div>
        </div>
      </div>
      <ReviewDetailCardContent review={review} user={user} />
    </section>
  );
}
