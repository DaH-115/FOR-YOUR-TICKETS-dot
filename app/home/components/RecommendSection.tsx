"use client";

import MovieCertification from "app/components/movie/MovieCertification";
import MoviePoster from "app/components/movie/MoviePoster";
import VideoPlayer from "app/components/movie/VideoPlayer";
import WriteButton from "app/components/ui/buttons/WriteButton";
import Background from "app/components/ui/layout/Background";
import MovieInfoCard from "app/home/components/MovieInfoCard";
import getMovieTitle from "app/utils/getEnrichMovieTitle";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";

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
    () => getMovieTitle(movie.original_title, movie.title),
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
    <article ref={sectionRef} className="relative">
      {movie?.backdrop_path && (
        <Background imageUrl={movie.backdrop_path} isFixed={true} />
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center justify-center gap-8 px-4 md:flex-row md:gap-12 lg:gap-16">
        {/* 영화 타이틀 및 정보 */}
        <section className="w-full md:w-3/5" aria-labelledby="movie-title">
          <header className="mb-6">
            <p className="mb-2 text-base font-semibold tracking-tight text-accent-300 lg:text-lg">
              오늘의 추천 영화
            </p>
            <h2
              id="movie-title"
              className="mb-2 text-2xl font-bold tracking-tight text-white md:text-4xl lg:mb-4 lg:text-5xl"
            >
              {movie.title}
            </h2>
            <div className="flex items-center gap-2">
              <p className="tracking-tight text-gray-300 lg:text-2xl">{`${movie.original_title} (${movie.release_date.split("-")[0]})`}</p>
              <MovieCertification certification={movie.certification ?? null} />
              {/* 평점 */}
              <div className="flex items-center">
                <FaStar className="mr-1 text-accent-300" />
                <p className="text-lg font-semibold text-white">{`${movie.vote_average.toFixed(1)}`}</p>
              </div>
            </div>

            {/* 장르 */}
            <p className="mt-4 text-sm text-gray-100">{`${movie.genres?.join(", ")}`}</p>

            {/* 줄거리 */}
            <p className="mt-6 break-words text-sm leading-loose tracking-tight text-gray-200 lg:text-base">
              {movie.overview}
            </p>
          </header>

          {/* 티켓 만들기 버튼 */}
          <div className="mt-6 flex items-center justify-end">
            <div className="w-1/2 lg:w-1/3">
              <WriteButton movieId={movie.id} />
            </div>
          </div>
        </section>

        {/* 영화 포스터 & 정보 카드 */}
        <section
          className={`flex w-full justify-center transition-transform duration-300 ease-in-out md:w-2/5 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          aria-label="영화 포스터 및 상세 정보"
        >
          <div className="group max-w-xs drop-shadow-xl transition-transform duration-300 ease-in-out hover:drop-shadow-2xl">
            {/* 전체 티켓을 3D 효과로 묶기 */}
            <div className="-rotate-y-6 rotate-x-4 group-hover:rotate-y-0 group-hover:rotate-x-0 pointer-events-auto relative skew-y-3 scale-75 transform transition-all duration-300 ease-out group-hover:skew-y-0 group-hover:scale-90">
              {/* 영화 포스터 */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
                <MoviePoster
                  posterPath={movie.poster_path}
                  title={movieTitle}
                />
                {/* 포스터 전용 테두리 효과 */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 transition-all duration-300 ease-out group-hover:border-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
              </div>

              {/* 영화 정보 카드 */}
              <MovieInfoCard movie={movie} />

              {/* 3D 그림자 효과 - 전체 티켓 아래에 */}
              <div className="absolute -bottom-2 left-2 right-2 h-4 rounded-2xl bg-black/20 blur-xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-black/30 group-hover:blur-2xl"></div>
            </div>
          </div>
        </section>
      </div>

      {/* 예고편 섹션 - 중앙 정렬 */}
      {trailerKey && (
        <section
          className="mx-auto mt-16 w-full max-w-4xl px-4"
          aria-labelledby="trailer-heading"
        >
          <h3
            id="trailer-heading"
            className="mb-4 text-center text-xl font-semibold tracking-tight text-white lg:text-2xl"
          >
            예고편
          </h3>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <VideoPlayer trailerKey={trailerKey} thumbnailSize={"large"} />
          </div>
        </section>
      )}
    </article>
  );
}
