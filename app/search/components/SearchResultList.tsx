"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Pagination from "app/components/ui/layout/Pagination";
import SwiperItem from "app/components/swiper/SwiperItem";
import Loading from "app/loading";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

interface SearchMovieResponse {
  movies: MovieList[];
  totalPages: number;
  totalResults: number;
  error?: string;
}

interface SearchResultListProps {
  searchQuery: string;
  onResultsLoaded?: (totalResults: number) => void;
}

export default function SearchResultList({
  searchQuery,
  onResultsLoaded,
}: SearchResultListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentPage = parseInt(params.get("page") ?? "1", 10);

  const [searchResults, setSearchResults] = useState<MovieList[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pageChangeHandler = useCallback(
    (page: number) => {
      router.replace(
        `${pathname}?query=${encodeURIComponent(searchQuery)}&page=${page}`,
      );
    },
    [pathname, searchQuery, router],
  );

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setTotalPages(0);
      onResultsLoaded?.(0);
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(
            searchQuery,
          )}&page=${currentPage}`,
        );
        const data: SearchMovieResponse = await res.json();

        // 에러 응답 처리
        if (!res.ok || data.error) {
          throw new Error(data.error || "검색 요청 실패");
        }

        setSearchResults(data.movies);
        setTotalPages(data.totalPages);
        onResultsLoaded?.(data.totalResults ?? 0);
      } catch (error) {
        console.error("영화 검색 중 오류:", (error as Error).message);
        setSearchResults([]);
        setTotalPages(0);
        onResultsLoaded?.(0);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [searchQuery, currentPage, onResultsLoaded]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xl text-white">
          {`"${searchQuery}"에 대한 검색 결과가 없습니다.`}
        </p>
      </div>
    );
  }

  // TMDB API는 페이지당 20개 결과를 반환함
  const RESULTS_PER_PAGE = 20;
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5">
        {searchResults.map((movie, idx) => (
          <SwiperItem
            key={movie.id}
            movie={movie}
            idx={startIndex + idx}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={pageChangeHandler}
      />
    </>
  );
}
