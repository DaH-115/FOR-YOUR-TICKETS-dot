"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReviewTicket from "app/components/review/ReviewTicket";
import Pagination from "app/components/ui/layout/Pagination";
import SearchSection from "app/components/search/SearchSection";
import EmptyState from "app/my-page/components/EmptyState";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import Link from "next/link";
import Loading from "app/loading";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태: 리스트, 페이지, 검색
  const [reviews, setReviews] = useState<ReviewDoc[]>(initialReviews);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  // page, search 동기화
  useEffect(() => {
    const newPage = parseInt(searchParams.get("page") || "1", 10);
    const newSearch = searchParams.get("search") || "";
    if (newPage !== page) setPage(newPage);
    if (newSearch !== search) setSearch(newSearch);
  }, [searchParams, page, search]);

  // page, search가 바뀔 때만 fetch
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reviews?page=${page}&search=${encodeURIComponent(search)}`,
        );
        const data = await res.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("fetchReviews error", error);
        setReviews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [page, search]);

  // 페이지네이션 핸들러
  const pageChangeHandler = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };
  // 페이지네이션 검색 핸들러
  const searchHandler = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchTerm);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  return (
    <main className="flex flex-col p-6">
      {/* 헤더 */}
      <header className="mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            모든 티켓
          </h1>
          <span className="ml-2 font-bold text-accent-300">
            {reviews.length}
          </span>
        </div>
        <p className="text-sm text-gray-300">
          모든 사용자들의 리뷰 티켓을 확인해보세요
        </p>
      </header>
      {/* 리뷰 목록 */}
      {loading ? (
        <Loading />
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-8 md:grid-cols-5 md:gap-x-3 md:gap-y-8 lg:grid-cols-6 lg:gap-x-4 lg:gap-y-10 xl:grid-cols-7 xl:gap-x-4 xl:gap-y-12 2xl:grid-cols-8 2xl:gap-x-5 2xl:gap-y-14">
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
              : "등록된 리뷰 티켓이 없습니다"
          }
        />
      )}
      {/* 페이지네이션 */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={pageChangeHandler}
      />
      {/* 검색 폼 & 결과 정보 */}
      <SearchSection
        searchTerm={search}
        resultCount={reviews.length}
        onSearch={searchHandler}
      />
    </main>
  );
}
