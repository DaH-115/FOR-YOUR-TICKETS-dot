"use client";

import ReviewTicket from "app/components/review/ReviewTicket";
import Pagination from "app/components/ui/layout/Pagination";
import SearchSection from "app/components/search/SearchSection";
import EmptyState from "app/my-page/components/EmptyState";
import type { ReviewDoc } from "types/review";

interface TicketListPageProps {
  reviews: ReviewDoc[];
  page: number;
  search: string;
  totalPages: number;
  totalCount: number;
}

export default function TicketListPage({
  reviews,
  page,
  search,
  totalPages,
  totalCount,
}: TicketListPageProps) {
  const buildPageHref = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (search) params.set("search", search);
    return `?${params.toString()}`;
  };

  return (
    <main className="3xl:max-w-[1600px] mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 헤더 */}
      <header className="mb-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">
            모든 티켓
          </h1>
          <span className="text-accent-300 ml-2 font-bold">{totalCount}</span>
        </div>
      </header>
      {/* 검색 폼 & 결과 정보 */}
      <SearchSection
        searchTerm={search}
        resultCount={reviews.length}
        basePath="/ticket-list"
      />
      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {reviews.map((review) => (
            <ReviewTicket key={review.id} review={review} />
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
        pageHref={buildPageHref}
      />
    </main>
  );
}
