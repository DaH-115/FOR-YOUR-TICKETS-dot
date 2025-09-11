"use client";

import { useSearchParams } from "next/navigation";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import TicketListLayout from "app/my-page/components/ticket-list-page/TicketListLayout";
import useLikedReviews from "app/my-page/hooks/useLikedReviews";

export default function Page() {
  return <LikedTicketListContainer />;
}

function LikedTicketListContainer() {
  const params = useSearchParams();
  const user = useAppSelector(selectUser);
  const currentPage = parseInt(params.get("page") || "1", 10);
  const searchTerm = params.get("search") || "";

  const { reviews, totalPages, loading, error } = useLikedReviews({
    uid: user?.uid || "",
    search: searchTerm,
    page: currentPage,
    pageSize: 10,
  });

  return (
    <TicketListLayout
      header={{
        title: "내가 좋아요한 티켓",
        content: "내가 좋아요한 티켓을 확인해 보세요",
      }}
      reviews={reviews}
      totalPages={totalPages}
      loading={loading}
      error={error}
    />
  );
}
