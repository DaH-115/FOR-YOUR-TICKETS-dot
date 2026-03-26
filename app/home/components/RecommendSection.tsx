"use client";

import MovieCertification from "@/components/movie/MovieCertification";
import MoviePoster from "@/components/movie/MoviePoster";
import VideoPlayer from "@/components/movie/VideoPlayer";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";
import type { MovieList, CrewMember } from "types/movie";
import { useMemo } from "react";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import MovieInfoCard from "@/components/movie/MovieInfoCard";

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
  const movieTitle = useMemo(
    () => getEnrichMovieTitle(movie.original_title, movie.title),
    [movie],
  );

  return (
    <article className="mx-auto max-w-5xl">
      <div className="mx-auto flex flex-col items-center justify-center md:flex-row">
        {/* 모바일: order-2로 포스터 아래 시각 배치 → md 이상에서는 order-1로 복귀(텍스트 왼쪽) */}
        <div className="order-2 w-full min-w-0 pb-16 md:order-1 md:pb-0 lg:mr-16 xl:max-w-2xl">
          <header className="mx-8 lg:mx-0">
            <p className="text-accent-300 lg:text-md mb-4 inline-block bg-[#222] px-2 py-1 text-sm font-semibold tracking-tight">
              오늘의 추천 영화
            </p>

            {/* 영화 제목 */}
            <h2 className="mb-2 text-4xl font-bold tracking-tight text-white lg:mb-4 lg:text-5xl">
              {movie.title}
            </h2>
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
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
            <div className="text-gray-200">{movie.genres?.join(" · ")}</div>
          </header>

          {/* 줄거리 */}
          {movie.overview && (
            <div className="mx-8 mt-6 md:mt-8 md:max-w-lg lg:mx-0">
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
            <section className="mx-8 mt-16 md:mt-24 lg:mx-0">
              <h3 className="mb-2 font-semibold tracking-tight text-gray-200">
                예고편
              </h3>
              <div className="aspect-video max-w-md overflow-hidden rounded-xl">
                <VideoPlayer trailerKey={trailerKey} />
              </div>
            </section>
          )}
        </div>

        {/* 모바일: order-1로 맨 위에 표시, md 이상에서는 order-2(텍스트 오른쪽) */}
        <div className="order-1 w-full max-w-sm md:order-2">
          <div className="group mx-auto drop-shadow-xl transition-transform duration-300 ease-in-out hover:drop-shadow-2xl">
            {/* 전체 티켓을 3D 효과로 묶기 */}
            <div className="pointer-events-auto relative scale-90 rotate-x-4 -rotate-y-6 skew-y-3 transform transition-all duration-300 ease-in-out group-hover:scale-90 group-hover:rotate-x-0 group-hover:rotate-y-0 group-hover:skew-y-0 lg:scale-80 lg:group-hover:scale-90">
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
