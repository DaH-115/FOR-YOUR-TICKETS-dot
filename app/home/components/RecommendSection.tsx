"use client";

import MovieCertification from "@/components/movie/MovieCertification";
import MoviePoster from "@/components/movie/MoviePoster";
import VideoPlayer from "@/components/movie/VideoPlayer";
import WriteButton from "@/components/ui/buttons/WriteButton";
import MovieInfoCard from "@/home/components/MovieInfoCard";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import Link from "next/link";

// 줄거리 텍스트를 자르는 유틸리티 함수
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

interface RecommendSectionProps {
  movie: MovieList;
  trailerKey?: string;
}

export default function RecommendSection({
  movie,
  trailerKey,
}: RecommendSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const movieTitle = useMemo(
    () => getEnrichMovieTitle(movie.original_title, movie.title),
    [movie],
  );

  // 클라이언트 사이드 렌더링 상태 관리
  const [isClient, setIsClient] = useState(false);

  // 줄거리 텍스트 처리
  const displayOverview = useMemo(() => {
    if (!movie.overview) return "";

    // SSR 중에는 기본값 사용, 클라이언트에서는 실제 화면 크기 반영
    const maxLength =
      isClient && typeof window !== "undefined" && window.innerWidth >= 768
        ? 300
        : 150;

    if (movie.overview.length <= maxLength) {
      return movie.overview;
    }

    return truncateText(movie.overview, maxLength);
  }, [movie.overview, isClient]);

  // 줄거리가 잘렸는지 확인
  const isOverviewTruncated = useMemo(() => {
    if (!movie.overview) return false;
    const maxLength =
      isClient && typeof window !== "undefined" && window.innerWidth >= 768
        ? 300
        : 150;
    return movie.overview.length > maxLength;
  }, [movie.overview, isClient]);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setIsClient(true);
  }, []);

  useEffect(() => {
    // ref 값을 변수에 저장
    const currentSection = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 컴포넌트가 화면에 20% 이상 보일 때 애니메이션 시작
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 한 번 트리거되면 더 이상 관찰하지 않음
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2, // 20% 이상 보일 때 트리거
        rootMargin: "0px 0px -50px 0px", // 하단에서 50px 전에 트리거
      },
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <article ref={sectionRef} className="mx-4 lg:mx-12 xl:mx-auto xl:max-w-4xl">
      <div className="mx-auto flex flex-col items-center justify-center lg:flex-row lg:gap-20">
        {/* 영화 타이틀 및 정보 */}
        <section className="mx-auto w-full">
          <header>
            <p className="mb-2 text-base font-semibold tracking-tight text-accent-300 lg:text-lg">
              오늘의 추천 영화
            </p>
            {/* 영화 제목 */}
            <h2 className="mb-2 text-4xl font-bold tracking-tight text-white lg:mb-4 lg:text-5xl">
              {movie.title}
            </h2>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              {/* 오리지널 제목 */}
              <p className="tracking-tight text-gray-300 lg:text-xl">{`${movie.original_title} (${movie.release_date.split("-")[0]})`}</p>
              <div className="flex items-center gap-2">
                {/* 등급 */}
                <MovieCertification
                  certification={movie.certification ?? null}
                />
                {/* 평점 */}
                <div className="flex items-center">
                  <FaStar className="mr-1 text-accent-300" />
                  <p className="text-xl font-semibold text-white">{`${movie.vote_average.toFixed(1)}`}</p>
                </div>
              </div>
            </div>

            {/* 장르 */}
            <p className="mt-4 text-sm text-gray-200 lg:mt-2">{`${movie.genres?.join(", ")}`}</p>

            {/* 줄거리 */}
            <div className="mt-6">
              <p className="break-words text-sm leading-loose tracking-tight text-white">
                {displayOverview}
              </p>
              <div className="text-right">
                {isOverviewTruncated && (
                  <Link
                    href={`/movie-details/${movie.id}`}
                    className="mt-2 text-sm font-medium text-accent-300 transition-colors hover:text-accent-200"
                  >
                    더 보기
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* 예고편 섹션 */}
          {trailerKey && (
            <section className="mt-8 hidden w-full lg:mt-18 lg:block lg:max-w-lg">
              <h3 className="mb-2 font-semibold tracking-tight text-gray-200">
                예고편
              </h3>
              <div className="aspect-video rounded-xl">
                <VideoPlayer trailerKey={trailerKey} thumbnailSize={"large"} />
              </div>
            </section>
          )}
        </section>

        {/* 영화 포스터 & 정보 카드 */}
        <section
          className={`w-full max-w-sm transition-transform duration-300 ease-in-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="group mx-auto drop-shadow-xl transition-transform duration-300 ease-in-out hover:drop-shadow-2xl">
            {/* 전체 티켓을 3D 효과로 묶기 */}
            <div className="-rotate-y-6 rotate-x-4 group-hover:rotate-y-0 group-hover:rotate-x-0 pointer-events-auto relative skew-y-3 scale-75 transform transition-all duration-300 ease-in-out group-hover:skew-y-0 group-hover:scale-90 lg:scale-90 lg:group-hover:scale-100">
              {/* 영화 포스터 */}
              <MoviePoster posterPath={movie.poster_path} title={movieTitle} />
              {/* 영화 정보 카드 */}
              <MovieInfoCard movie={movie} />
              {/* 티켓 만들기 버튼 */}
              <WriteButton movieId={movie.id} />
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
