"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IoChevronDown } from "react-icons/io5";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { getTrendingMoviesUpdateTime } from "app/utils/formatUpdateTime";

interface TrendingSearchSectionProps {
  trendingMovies: MovieList[];
  onSearch: (query: string) => void;
}

export default function TrendingSearchSection({
  trendingMovies,
  onSearch,
}: TrendingSearchSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMovieClick = (movieTitle: string) => {
    onSearch(movieTitle);
    router.replace(
      `${pathname}?query=${encodeURIComponent(movieTitle)}&page=1`,
    );
  };

  return (
    <section className="mx-auto mb-16 w-3/4 lg:w-1/2">
      <h3 className="mb-4 text-lg font-semibold text-white">
        인기 검색어 TOP 10
      </h3>
      <div className="flex flex-col space-y-2 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        {/* 1~5위 */}
        <div className="space-y-2">
          {trendingMovies.slice(0, 5).map((movie, index) => (
            <button
              key={movie.id}
              onClick={() => handleMovieClick(movie.title)}
              className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white group-hover:text-accent-300">
                  {movie.title}
                </p>
                <p className="text-xs text-gray-400">
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "개봉년도 미상"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 6~10위 */}
        <div className="space-y-2">
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isExpanded
                ? "max-h-screen translate-y-0 opacity-100"
                : "max-h-0 -translate-y-4 opacity-0"
            } md:max-h-none md:translate-y-0 md:opacity-100`}
          >
            {trendingMovies.slice(5, 10).map((movie, index) => (
              <div
                key={movie.id}
                className={`transition-all duration-300 ease-out ${
                  isExpanded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                } md:translate-y-0 md:opacity-100`}
                style={{
                  transitionDelay: isExpanded ? `${index * 100}ms` : "0ms",
                }}
              >
                <button
                  onClick={() => handleMovieClick(movie.title)}
                  className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                    {index + 6}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white group-hover:text-accent-300">
                      {movie.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "개봉년도 미상"}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일에서만 보이는 더보기/접기 버튼 */}
      <div className="mt-4 flex justify-center md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-all duration-300 hover:scale-105"
        >
          <span>{isExpanded ? "접기" : "더보기"}</span>
          <IoChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* 갱신 시점 표시 */}
      <div className="mt-4 border-t border-gray-700/50 pt-3">
        <p className="text-xs text-gray-400">{getTrendingMoviesUpdateTime()}</p>
      </div>
    </section>
  );
}
