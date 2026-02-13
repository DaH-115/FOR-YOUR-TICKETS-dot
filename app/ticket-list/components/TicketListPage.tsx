"use client";

import ReviewTicket from "app/components/review/ReviewTicket";
import Pagination from "app/components/ui/layout/Pagination";
import SearchSection from "app/components/search/SearchSection";
import EmptyState from "app/my-page/components/EmptyState";
import type { ReviewDoc } from "types/review";
import Link from "next/link";
import Loading from "@/loading";
import useTicketList from "@/ticket-list/hooks/useTicketList";

interface TicketListPageProps {
  initialReviews: ReviewDoc[];
  initialPage: number;
  initialSearch: string;
  initialTotalPages: number;
}

export default function TicketListPage({
  initialReviews,
  initialPage,
  initialSearch,
  initialTotalPages,
}: TicketListPageProps) {
  const { reviews, page, search, totalPages, loading, onPageChange, onSearch } =
    useTicketList({
      initialReviews,
      initialPage,
      initialSearch,
      initialTotalPages,
    });

  if (loading) return <Loading />;

  return (
    <main className="mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
      {/* 헤더 */}
      <header className="mb-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">
            모든 티켓
          </h1>
          <span className="ml-2 font-bold text-accent-300">
            {reviews.length}
          </span>
        </div>
      </header>
      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {reviews.map((review) => (
            <Link key={review.id} href={`/ticket-list/${review.id}`}>
              <ReviewTicket review={review} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          message={
            search
              ? `"${search}"에 대한 검색 결과가 없습니다`
              : "등록된 티켓이 없습니다"
          }
        />
      )}
      {/* 페이지네이션 */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      {/* 검색 폼 & 결과 정보 */}
      <SearchSection
        searchTerm={search}
        resultCount={reviews.length}
        onSearch={onSearch}
      />
    </main>
  );
}
