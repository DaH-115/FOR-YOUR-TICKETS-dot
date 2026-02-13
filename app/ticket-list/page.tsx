import { Metadata } from "next";
import TicketListPage from "app/ticket-list/components/TicketListPage";
import { fetchReviewsPaginated } from "lib/reviews/fetchReviewsPaginated";

export const metadata: Metadata = {
  title: "티켓 목록",
  description: "모든 사용자들의 티켓을 확인해보세요",
};

interface searchParamsProps {
  page?: string;
  search?: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<searchParamsProps>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page ?? "1", 10);
  const search = resolvedSearchParams.search?.trim() ?? "";

  const { reviews, totalPages } = await fetchReviewsPaginated({
    page,
    pageSize: 10,
    search,
  });

  return (
    <TicketListPage
      initialReviews={reviews}
      initialPage={page}
      initialSearch={search}
      initialTotalPages={totalPages}
    />
  );
}
