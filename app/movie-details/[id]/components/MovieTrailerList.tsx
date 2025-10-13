"use client";

import { useState, useEffect } from "react";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import VideoPlayer from "app/components/movie/VideoPlayer";
import { MovieTrailer } from "lib/movies/fetchVideosMovies";

// Tailwind CSS 브레이크포인트 상수
const BREAKPOINTS = {
  sm: 640, // 태블릿
  md: 768, // 중간 태블릿
  lg: 1024, // 데스크톱
  xl: 1280, // 대형 데스크톱
  "2xl": 1536, // 초대형 화면
} as const;

export default function MovieTrailerList({
  trailerList,
}: {
  trailerList: MovieTrailer[];
}) {
  const [showAll, setShowAll] = useState(false);
  const [currentItemsPerRow, setCurrentItemsPerRow] = useState(4);

  // 화면 크기에 따른 한 줄 개수 계산 (Tailwind 브레이크포인트 기준)
  useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      let newItemsPerRow;

      if (width < BREAKPOINTS.sm) {
        // sm 미만 (모바일)
        newItemsPerRow = 1;
      } else if (width < BREAKPOINTS.lg) {
        // sm 이상 lg 미만 (태블릿)
        newItemsPerRow = 2;
      } else if (width < BREAKPOINTS.xl) {
        // lg 이상 xl 미만 (데스크톱)
        newItemsPerRow = 3;
      } else {
        // xl 이상 (대형 화면)
        newItemsPerRow = 4;
      }

      if (newItemsPerRow !== currentItemsPerRow) {
        setCurrentItemsPerRow(newItemsPerRow);
      }
    };

    // 초기 설정
    updateItemsPerRow();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", updateItemsPerRow, { passive: true });

    return () => window.removeEventListener("resize", updateItemsPerRow);
  }, [currentItemsPerRow]);

  const shouldShowMoreButton = trailerList.length > currentItemsPerRow;
  const displayedTrailers = showAll
    ? trailerList
    : trailerList.slice(0, currentItemsPerRow);

  return (
    <section className="mx-4 py-8 lg:mx-12 lg:py-16 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
      <header className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">예고편</h2>
      </header>
      {trailerList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedTrailers.map((trailer) => (
              <div key={trailer.id} className="aspect-video">
                <VideoPlayer trailerKey={trailer.key} />
              </div>
            ))}
          </div>
          {shouldShowMoreButton && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="rounded-full px-6 py-3 text-sm text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/50"
              >
                {showAll ? (
                  <div className="flex items-center">
                    <span>접기</span>
                    <IoChevronUp className="ml-1" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>
                      더 보기 ({trailerList.length - currentItemsPerRow}개 더)
                    </span>
                    <IoChevronDown className="ml-1" />
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
