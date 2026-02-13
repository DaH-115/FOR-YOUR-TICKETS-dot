"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReviewDoc } from "types/review";
import { getAuthHeaders } from "@/utils/getIdToken";
import { mergeLikeStatuses } from "@/utils/api";

interface UseTicketListParams {
  initialReviews: ReviewDoc[];
  initialPage: number;
  initialSearch: string;
  initialTotalPages: number;
}

/**
 * 티켓 리스트 페이지의 데이터 페칭, URL 동기화, 좋아요 상태를 관리하는 훅
 */
export default function useTicketList({
  initialReviews,
  initialPage,
  initialSearch,
  initialTotalPages,
}: UseTicketListParams) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태: 리스트, 페이지, 검색
  const [reviews, setReviews] = useState<ReviewDoc[]>(initialReviews);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  // URL searchParams → 로컬 상태 동기화
  useEffect(() => {
    const newPage = parseInt(searchParams.get("page") || "1", 10);
    const newSearch = searchParams.get("search") || "";
    if (newPage !== page) setPage(newPage);
    if (newSearch !== search) setSearch(newSearch);
  }, [searchParams, page, search]);

  // page, search가 바뀔 때 리뷰 데이터 fetch
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reviews?page=${page}&search=${encodeURIComponent(search)}`,
        );
        const data = await res.json();

        let nextReviews: ReviewDoc[] = data.reviews || [];
        setTotalPages(data.totalPages || 1);

        // 로그인 상태라면 좋아요 상태 동기화
        nextReviews = await syncLikeStatuses(nextReviews);

        setReviews(nextReviews);
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

  // 페이지 변경 핸들러
  const onPageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // 검색 핸들러
  const onSearch = useCallback(
    (searchTerm: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", searchTerm);
      params.set("page", "1");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { reviews, page, search, totalPages, loading, onPageChange, onSearch };
}

// ─── 내부 헬퍼 ──────────────────────────────────

/**
 * 리뷰 목록에 좋아요 상태를 병합
 * - 인증 실패/네트워크 오류 시 원본 데이터를 그대로 반환
 */
async function syncLikeStatuses(reviews: ReviewDoc[]): Promise<ReviewDoc[]> {
  if (reviews.length === 0) return reviews;

  try {
    const reviewIds = reviews.map((r) => r.id);
    const authHeaders = await getAuthHeaders();
    const likeRes = await fetch(`/api/reviews/like-statuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ reviewIds }),
    });

    if (likeRes.ok) {
      const likeData = (await likeRes.json()) as {
        likes: Record<string, boolean>;
      };
      if (likeData?.likes) {
        return mergeLikeStatuses(reviews, likeData.likes);
      }
    }
  } catch {
    // 인증 실패/네트워크 오류는 초기 렌더 UX를 위해 무시
    console.error("like-statuses 동기화 실패");
  }

  return reviews;
}
