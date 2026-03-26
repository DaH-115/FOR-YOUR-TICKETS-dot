"use client";

import { useState, useLayoutEffect } from "react";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import VideoPlayer from "app/components/movie/VideoPlayer";
import { MovieTrailer } from "lib/movies/fetchVideosMovies";

/**
 * 그리드 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`와
 * 동일한 Tailwind 기본 브레이크포인트(min-width)를 사용합니다.
 * 그리드 열 수를 바꿀 때 이 함수도 함께 맞춰야 합니다.
 */
function getItemsPerRowFromViewport(): number {
  if (typeof window === "undefined") return 4;
  if (window.matchMedia("(min-width: 1280px)").matches) return 4; // xl
  if (window.matchMedia("(min-width: 1024px)").matches) return 3; // lg
  if (window.matchMedia("(min-width: 640px)").matches) return 2; // sm
  return 1;
}

export default function MovieTrailerList({
  trailerList,
}: {
  trailerList: MovieTrailer[];
}) {
  const [showAll, setShowAll] = useState(false);
  const [currentItemsPerRow, setCurrentItemsPerRow] = useState(4);

  // 첫 페인트 전에 뷰포트 기준으로 한 줄 개수 동기화 + 리사이즈 시 rAF로 갱신
  useLayoutEffect(() => {
    let rafId = 0;

    const applyItemsPerRow = () => {
      const next = getItemsPerRowFromViewport();
      setCurrentItemsPerRow((prev) => (next !== prev ? next : prev));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(applyItemsPerRow);
    };

    applyItemsPerRow();

    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const shouldShowMoreButton = trailerList.length > currentItemsPerRow;
  const displayedTrailers = showAll
    ? trailerList
    : trailerList.slice(0, currentItemsPerRow);

  return (
    <section className="3xl:max-w-[1600px] mx-4 py-8 lg:mx-12 lg:py-16 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      <header className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">예고편</h2>
      </header>
      {trailerList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedTrailers.map((trailer) => {
              const title = (trailer.name ?? "").trim() || "제목 없음";
              return (
                <figure key={trailer.id} className="m-0 flex flex-col gap-2">
                  <div className="aspect-video overflow-hidden rounded-xl">
                    <VideoPlayer trailerKey={trailer.key} />
                  </div>
                  <figcaption className="line-clamp-2 text-sm leading-snug text-gray-200">
                    {title}
                  </figcaption>
                </figure>
              );
            })}
          </div>
          {shouldShowMoreButton && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                aria-expanded={showAll}
                aria-label={showAll ? "예고편 목록 접기" : "예고편 더 보기"}
                onClick={() => setShowAll(!showAll)}
                className="rounded-full px-6 py-3 text-sm text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:ring-1 focus:ring-white/50 focus:outline-hidden"
              >
                {showAll ? (
                  <div className="flex items-center">
                    <span>접기</span>
                    <IoChevronUp className="ml-1" aria-hidden />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>
                      더 보기 ({trailerList.length - currentItemsPerRow}개 더)
                    </span>
                    <IoChevronDown className="ml-1" aria-hidden />
                  </div>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="w-full py-4 text-center text-sm text-gray-400">
          등록된 예고편이 없습니다
        </p>
      )}
    </section>
  );
}
