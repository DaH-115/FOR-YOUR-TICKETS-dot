// 좋아요한 리뷰 목록(페이지네이션, 검색 등) 비동기 조회 및 상태 관리 커스텀 훅
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthHeaders } from "@/utils/getIdToken";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";

interface UseLikedReviewsOptions {
  uid: string;
  search?: string;
  page: number;
  pageSize?: number;
}

export default function useLikedReviews({
  uid,
  search = "",
  page,
  pageSize = 10,
}: UseLikedReviewsOptions) {
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!uid) {
      setReviews([]);
      setTotalPages(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries({ uid, search, page, pageSize }).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
          }
        },
      );
      const authHeaders = await getAuthHeaders();
      const response = await fetch(
        `/api/reviews/liked-by-user?${searchParams.toString()}`,
        {
          headers: {
            ...authHeaders,
          },
        },
      );
      if (!response.ok) {
        throw new Error("리뷰 데이터를 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [uid, search, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { reviews, totalPages, loading, error, refetch: fetchData };
}
