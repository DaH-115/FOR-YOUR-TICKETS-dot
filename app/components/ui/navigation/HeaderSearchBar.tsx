"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

interface HeaderSearchBarProps {
  isSideMenuOpen: boolean;
  onSearchOpenChange?: (isOpen: boolean) => void;
}

export default function HeaderSearchBar({
  isSideMenuOpen,
  onSearchOpenChange,
}: HeaderSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MovieList[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const iconClickHandler = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setResults([]);
    setVisibleCount(5);
    setIsSearchOpen(false);
  }, []);

  const movieSelect = useCallback(
    (movie: MovieList | null) => {
      if (movie) {
        // 영화 선택 시 해당 페이지로 이동
        router.push(`/movie-details/${movie.id}`);
        resetSearch();
      }
    },
    [router, resetSearch],
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim()) {
          try {
            const res = await fetch(
              `/api/tmdb/search?query=${encodeURIComponent(query)}&page=1`,
            );
            if (!res.ok) throw new Error("검색 실패");
            const data = await res.json();
            setResults(data.movies);
            setVisibleCount(5);
          } catch (error) {
            console.error("검색 실패:", error);
            setResults([]);
          }
        } else {
          setResults([]);
        }
      }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // isSearchOpen 상태 변경을 부모에게 알림
  useEffect(() => {
    onSearchOpenChange?.(isSearchOpen);
  }, [isSearchOpen, onSearchOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        resetSearch();
      }
    };
    if (isSearchOpen && typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [isSearchOpen, resetSearch]);

  return (
    <div className="hidden lg:block" ref={searchBarRef}>
      <Combobox value={null} onChange={movieSelect}>
        <div className="relative flex items-center justify-end">
          <div
            className={`relative flex items-center rounded-full border border-white/30 bg-white/10 transition-all duration-300 ease-in-out hover:border-white/50 hover:bg-white/20 ${
              !isSideMenuOpen ? "backdrop-blur-sm" : ""
            } ${isSearchOpen ? "h-12 w-64" : "h-12 w-12"}`}
          >
            <ComboboxInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="영화 검색"
              className={`w-full rounded-full bg-transparent py-3 pl-6 pr-14 text-sm text-white placeholder-white/70 transition-all duration-300 ease-in-out focus:outline-none ${
                isSearchOpen ? "opacity-100" : "opacity-0"
              }`}
              displayValue={() => searchQuery}
            />
            <div
              className="absolute right-0 top-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-white/10"
              onClick={iconClickHandler}
            >
              <IoSearchOutline size={18} color="white" />
            </div>
          </div>

          {results.length > 0 && (
            <ComboboxOptions
              modal={false}
              transition
              className={`absolute right-0 top-full z-10 mt-2 max-h-96 w-64 origin-top-right overflow-auto rounded-xl border border-white/20 bg-black/90 shadow-xl transition duration-200 ease-out scrollbar-hide focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 ${
                !isSideMenuOpen ? "backdrop-blur-md" : ""
              }`}
            >
              {results.slice(0, visibleCount).map((result) => (
                <ComboboxOption
                  key={result.id}
                  value={result}
                  className="cursor-pointer px-4 py-3 text-white transition-colors data-[focus]:bg-white/10"
                >
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-white/70">
                    ({result.release_date?.slice(0, 4) || "개봉일 미정"})
                  </p>
                </ComboboxOption>
              ))}

              {/* 더 보기 버튼 */}
              {visibleCount < results.length && (
                <div className="border-t border-white/10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="w-full cursor-pointer px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/10"
                  >
                    더 보기
                  </button>
                </div>
              )}

              {/* 전체 검색 페이지로 이동 */}
              {results.length >= 20 && (
                <div className="border-t border-white/10">
                  <Link
                    href={`/search?query=${encodeURIComponent(searchQuery)}`}
                    onClick={resetSearch}
                    className="flex w-full cursor-pointer items-center bg-white/5 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/10"
                  >
                    전체 검색 결과 보기
                    <FaArrowRight className="ml-2 text-white/50" />
                  </Link>
                </div>
              )}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  );
}
