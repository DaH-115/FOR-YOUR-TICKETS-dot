"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoSearchOutline } from "react-icons/io5";
import * as z from "zod";
import SwiperItem from "@/components/swiper/SwiperItem";
import SearchResultList from "@/search/components/SearchResultList";
import TrendingSearchSection from "@/search/components/TrendingSearchSection";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

const searchSchema = z.object({ searchQuery: z.string() });
type SearchSchema = z.infer<typeof searchSchema>;

interface SearchPageProps {
  nowPlayingMovies: MovieList[];
  trendingMovies: MovieList[];
}

export default function SearchPage({
  nowPlayingMovies,
  trendingMovies,
}: SearchPageProps) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const searchTerm = params.get("query") ?? "";

  const { register, watch, reset } = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: { searchQuery: searchTerm },
  });

  useEffect(() => {
    reset({ searchQuery: searchTerm });
  }, [searchTerm, reset]);

  const watchedQuery = watch("searchQuery");

  const [debouncedQuery] = useDebounce(watchedQuery, 300);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  useEffect(() => {
    const query = debouncedQuery ?? "";
    const cleaned = query.trim().replace(/\s+/g, " ");
    const queryString = cleaned
      ? `?query=${encodeURIComponent(cleaned)}&page=1`
      : "";
    router.replace(`${pathname}${queryString}`);
  }, [debouncedQuery, router, pathname]);

  useEffect(() => {
    if (!searchTerm) setTotalResults(null);
  }, [searchTerm]);

  return (
    <main className="3xl:max-w-[1600px] mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 헤더 영역 */}
      <header className="sr-only">
        <h1 className="text-xl font-bold tracking-tight text-white">검색</h1>
      </header>

      {/* 검색 입력폼 */}
      <section className="mx-auto mb-8 lg:w-1/3" aria-label="영화 검색">
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="relative flex items-center"
        >
          <input
            {...register("searchQuery")}
            type="search"
            placeholder="영화 제목으로 검색해 보세요"
            className="focus:ring-accent-300 w-full rounded-full bg-white py-2 pr-12 pl-4 text-sm tracking-tight text-gray-900 outline-hidden focus:ring-1"
            aria-label="영화 제목 검색"
          />
          <button type="submit" className="absolute right-3" aria-label="검색">
            <IoSearchOutline size={20} />
          </button>
        </form>
      </section>

      {/* 검색어가 없을 때만 인기 검색어 TOP 10 표시 */}
      {!searchTerm && (
        <TrendingSearchSection
          trendingMovies={trendingMovies}
          onSearch={(query) => reset({ searchQuery: query })}
        />
      )}

      {/* 검색 결과 또는 상영 중인 영화 */}
      {searchTerm ? (
        <section>
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              검색 결과
              {totalResults !== null && (
                <span className="text-accent-300 ml-2 font-bold">
                  {totalResults.toLocaleString()}
                </span>
              )}
            </h2>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{`"${searchTerm}" 검색 결과 ${totalResults !== null ? totalResults.toLocaleString() : "..."}`}</span>
            </div>
          </div>
          <div>
            <SearchResultList
              searchQuery={searchTerm}
              onResultsLoaded={setTotalResults}
            />
          </div>
        </section>
      ) : (
        <section className="mb-16">
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              상영 중인 영화
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5">
            {nowPlayingMovies.map((movie, idx) => (
              <SwiperItem key={movie.id} movie={movie} idx={idx} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
