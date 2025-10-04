"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
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

  const debounceHandler = useMemo(
    () =>
      debounce((query: string) => {
        const cleaned = query.trim().replace(/\s+/g, " ");
        const queryString = cleaned
          ? `?query=${encodeURIComponent(cleaned)}&page=1`
          : "";
        router.replace(`${pathname}${queryString}`);
      }, 300),
    [router, pathname],
  );

  useEffect(() => {
    debounceHandler(watchedQuery);
    return () => {
      debounceHandler.cancel();
    };
  }, [watchedQuery, debounceHandler]);

  return (
    <main className="mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
      {/* 헤더 영역 */}
      <header className="sr-only">
        <h1 className="text-xl font-bold tracking-tight text-white">검색</h1>
      </header>

      {/* 검색 입력폼 */}
      <section className="mx-auto mb-8 lg:w-1/3">
        <div className="relative flex items-center">
          <input
            {...register("searchQuery")}
            type="search"
            placeholder="영화 제목으로 검색해 보세요"
            className="w-full rounded-xl bg-gray-600 py-2 pl-4 pr-12 text-sm tracking-tight text-white outline-none"
          />
          <button type="button" className="absolute right-3">
            <IoSearchOutline className="text-gray-400" size={20} />
          </button>
        </div>
      </section>

      {/* 인기 검색어 TOP 10 */}
      {!searchTerm && (
        <TrendingSearchSection
          trendingMovies={trendingMovies}
          onSearch={(query) => reset({ searchQuery: query })}
        />
      )}

      {/* 검색 결과 또는 상영 중인 영화 */}
      {searchTerm ? (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white">
              검색 결과
            </h2>
          </div>
          <div>
            <SearchResultList searchQuery={searchTerm} />
          </div>
        </section>
      ) : (
        <section className="mb-16">
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              상영 중인 영화
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {nowPlayingMovies.map((movie, idx) => (
              <SwiperItem key={movie.id} movie={movie} idx={idx} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
