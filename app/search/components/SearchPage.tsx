"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoSearchOutline } from "react-icons/io5";
import * as z from "zod";
import SwiperItem from "app/components/swiper/SwiperItem";
import SearchResultList from "app/search/components/SearchResultList";
import TrendingSearchSection from "app/search/components/TrendingSearchSection";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

const searchSchema = z.object({ searchQuery: z.string() });
type SearchSchema = z.infer<typeof searchSchema>;

export default function SearchPage({
  nowPlayingMovies,
  trendingMovies,
}: {
  nowPlayingMovies: MovieList[];
  trendingMovies: MovieList[];
}) {
  const resultsRef = useRef<HTMLElement>(null);
  const nowPlayingRef = useRef<HTMLElement>(null);

  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const searchTerm = params.get("query") ?? "";

  const { register, watch, reset } = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: { searchQuery: searchTerm },
  });

  // 검색 결과 섹션 Observer 설정
  useEffect(() => {
    const currentResults = resultsRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsResultsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
    );

    if (currentResults) {
      observer.observe(currentResults);
    }

    return () => {
      if (currentResults) {
        observer.unobserve(currentResults);
      }
    };
  }, [searchTerm]); // searchTerm이 변경될 때마다 Observer 재설정

  // 검색어 상태에 따른 섹션 가시성 관리
  useEffect(() => {
    if (searchTerm) {
      setIsResultsVisible(true);
      setIsNowPlayingVisible(false); // 검색어가 있으면 상영 중인 영화 섹션 숨김
    } else {
      setIsResultsVisible(false); // 검색어가 없으면 검색 결과 섹션 숨김
      // 상영 중인 영화 섹션은 Observer가 처리하도록 함
    }
  }, [searchTerm]);

  // 상영 중인 영화 섹션 Observer 설정
  useEffect(() => {
    // 검색어가 있을 때는 Observer를 설정하지 않음
    if (searchTerm) return;

    const currentNowPlaying = nowPlayingRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNowPlayingVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
    );

    if (currentNowPlaying) {
      observer.observe(currentNowPlaying);
    }

    return () => {
      if (currentNowPlaying) {
        observer.unobserve(currentNowPlaying);
      }
    };
  }, [searchTerm]); // searchTerm이 변경될 때마다 Observer 재설정

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
      <section className="mx-auto mb-16 w-3/4 lg:w-1/3">
        <div className="relative flex items-center">
          <input
            {...register("searchQuery")}
            type="search"
            placeholder="검색어를 입력하세요"
            className="w-full rounded-full bg-white py-3 pl-4 pr-12 text-sm text-black focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1"
          />
          <button type="button" className="absolute right-4">
            <IoSearchOutline size={24} />
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
        <section ref={resultsRef}>
          <div
            className={`mb-6 transition-all duration-700 ease-out ${
              isResultsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <h2 className="text-xl font-bold tracking-tight text-white">
              검색 결과
            </h2>
          </div>
          <div
            className={`transition-all duration-700 ease-out ${
              isResultsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <SearchResultList searchQuery={searchTerm} />
          </div>
        </section>
      ) : (
        <section ref={nowPlayingRef} className="mb-16">
          <div
            className={`mb-4 transition-all duration-700 ease-out ${
              isNowPlayingVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <h2 className="text-xl font-bold tracking-tight text-white">
              상영 중인 영화
            </h2>
          </div>
          <div
            className={`grid grid-cols-2 gap-x-2 gap-y-6 transition-all delay-200 duration-700 ease-out sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 ${
              isNowPlayingVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            {nowPlayingMovies.map((movie, idx) => (
              <SwiperItem key={movie.id} movie={movie} idx={idx} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
