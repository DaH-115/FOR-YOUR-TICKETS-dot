"use client";

import { useSearchParams } from "next/navigation";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import TicketListLayout from "app/my-page/components/ticket-list-page/TicketListLayout";
import useMyReviews from "app/my-page/hooks/useMyReviews";

export default function Page() {
  return <MyTicketListContainer />;
}

function MyTicketListContainer() {
  const params = useSearchParams();
  const user = useAppSelector(selectUser);
  const currentPage = parseInt(params.get("page") || "1", 10);
  const searchTerm = params.get("search") || "";

  const { reviews, totalPages, loading, error } = useMyReviews({
    uid: user?.uid || "",
    search: searchTerm,
    page: currentPage,
    pageSize: 10,
  });

  return (
    <TicketListLayout
      title={"내가 작성한 티켓"}
      reviews={reviews}
      totalPages={totalPages}
      loading={loading}
      error={error}
    />
  );
}
