"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "app/components/ui/layout/Pagination";
import ReviewTicket from "app/components/review/ReviewTicket";
import SearchSection from "app/components/search/SearchSection";
import EmptyState from "app/my-page/components/EmptyState";
import { buildQueryUrl } from "app/my-page/utils/buildQueryUrl";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import Link from "next/link";

interface TicketListLayoutProps {
  title: string;
  reviews: ReviewDoc[];
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export default function TicketListLayout({
  title,
  reviews,
  totalPages,
  loading,
  error,
}: TicketListLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentPage = parseInt(params.get("page") || "1", 10);
  const searchTerm = params.get("search") || "";
  const user = useAppSelector(selectUser);

  const searchHandler = (term: string) => {
    const url = buildQueryUrl({
      pathname,
      params: { uid: user?.uid || "", search: term, page: 1 },
    });
    router.replace(url);
  };

  const pageChangeHandler = (page: number) => {
    const url = buildQueryUrl({
      pathname,
      params: { uid: user?.uid || "", search: searchTerm, page },
    });
    router.push(url);
  };

  return (
    <main className="mx-auto w-full flex-col">
      {/* 헤더 */}
      <header className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <span className="text-accent-300 ml-2 text-lg font-bold">
          {reviews.length}
        </span>
      </header>

      {/* 검색 폼 & 결과 정보 */}
      <SearchSection
        searchTerm={searchTerm}
        resultCount={reviews.length}
        onSearch={searchHandler}
      />

      {/* 리뷰 목록 */}
      {loading ? (
        <EmptyState message="불러오는 중..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="font-medium text-red-600">오류가 발생했습니다</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {reviews.map((review) => (
            <Link key={review.id} href={`/ticket-list/${review.id}`}>
              <ReviewTicket review={review} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          message={
            searchTerm
              ? `"${searchTerm}"에 대한 검색 결과가 없습니다`
              : "등록된 티켓이 없습니다"
          }
        />
      )}
      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={pageChangeHandler}
      />
    </main>
  );
}
