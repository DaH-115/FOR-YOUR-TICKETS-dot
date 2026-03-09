"use client";

import MovieCertification from "@/components/movie/MovieCertification";
import MoviePoster from "@/components/movie/MoviePoster";
import VideoPlayer from "@/components/movie/VideoPlayer";
import MovieInfoCard from "@/home/components/MovieInfoCard";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";
import type { MovieList, CrewMember } from "types/movie";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import Link from "next/link";

interface RecommendSectionProps {
  movie: MovieList;
  trailerKey?: string;
  genres: string[];
  uniqueDirectors: CrewMember[];
}

export default function RecommendSection({
  movie,
  trailerKey,
  genres,
  uniqueDirectors,
}: RecommendSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const movieTitle = useMemo(
    () => getEnrichMovieTitle(movie.original_title, movie.title),
    [movie],
  );

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
    <article
      ref={sectionRef}
      className="mx-auto max-w-2xl px-4 lg:mb-16 lg:max-w-3xl lg:px-0 xl:max-w-5xl 2xl:max-w-6xl"
    >
      <div className="mx-auto flex flex-col items-center justify-center md:flex-row">
        {/* 영화 타이틀 및 정보 */}
        <div className="mx-auto mr-8 w-full xl:max-w-2xl">
          <header className="sm:mx-4 lg:mx-0">
            <p className="text-accent-300 mb-2 text-sm font-semibold tracking-tight lg:text-lg">
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
                  <FaStar className="text-accent-300 mr-1" />
                  <span className="text-xl font-semibold text-white">{`${movie.vote_average.toFixed(1)}`}</span>
                </div>
              </div>
            </div>

            {/* 장르 */}
            <p className="mt-4 text-sm text-gray-200 lg:mt-2">{`${movie.genres?.join(", ")}`}</p>
          </header>

          {/* 줄거리 */}
          {movie.overview && (
            <div className="mt-6 sm:mx-4 md:mt-8 md:max-w-lg lg:mx-0">
              <p className="line-clamp-3 text-sm leading-loose tracking-tight wrap-break-word text-white">
                {movie.overview}
              </p>
              <div className="text-right">
                <Link
                  href={`/movie-details/${movie.id}`}
                  className="text-accent-300 text-sm transition-colors duration-300 hover:font-semibold"
                >
                  더 보기
                </Link>
              </div>
            </div>
          )}

          {/* 예고편 */}
          {trailerKey && (
            <section className="mt-8 w-full lg:mt-18 lg:max-w-lg">
              <h3 className="mb-2 font-semibold tracking-tight text-gray-200">
                예고편
              </h3>
              <div className="aspect-video rounded-xl">
                <VideoPlayer trailerKey={trailerKey} thumbnailSize={"large"} />
              </div>
            </section>
          )}
        </div>

        {/* 영화 포스터 & 정보 카드 */}
        <div
          className={`w-full max-w-sm transition-transform duration-300 ease-in-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="group mx-auto drop-shadow-xl transition-transform duration-300 ease-in-out hover:drop-shadow-2xl">
            {/* 전체 티켓을 3D 효과로 묶기 */}
            <div className="pointer-events-auto relative scale-75 rotate-x-4 -rotate-y-6 skew-y-3 transform transition-all duration-300 ease-in-out group-hover:scale-90 group-hover:rotate-x-0 group-hover:rotate-y-0 group-hover:skew-y-0 lg:scale-90 lg:group-hover:scale-100">
              {/* 영화 포스터 */}
              <MoviePoster
                posterPath={movie.poster_path}
                title={movieTitle}
                importance="hero"
              />
              {/* 영화 정보 카드 */}
              <MovieInfoCard
                movie={movie}
                genres={genres}
                uniqueDirectors={uniqueDirectors}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
