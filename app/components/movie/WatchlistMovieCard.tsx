"use client";

import Link from "next/link";
import MoviePoster from "@/components/movie/MoviePoster";
import AddWatchlistButton from "@/components/movie/AddWatchlistButton";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";

interface MovieDetails {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string;
  genres: { id: number; name: string }[];
  certification?: string | null;
}

interface WatchlistMovieCardProps {
  movie: MovieDetails;
}

export default function WatchlistMovieCard({ movie }: WatchlistMovieCardProps) {
  const releaseYear = movie.release_date?.slice(0, 4) || "개봉일 미정";
  const displayTitle = getEnrichMovieTitle(movie.original_title, movie.title);

  return (
    <div className="group relative">
      <Link href={`/movie-details/${movie.id}`}>
        <MoviePoster posterPath={movie.poster_path || ""} title={movie.title} />
      </Link>

      {/* 그라데이션 배경 */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* 영화 정보 오버레이 */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="text-white">
          {/* 메인 제목 */}
          <h3 className="mb-1 text-sm font-semibold leading-tight">
            {displayTitle}
          </h3>

          {/* 개봉 연도 */}
          <p className="text-xs text-white/70">{releaseYear}</p>
        </div>
      </div>

      {/* 워치리스트 버튼 */}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <AddWatchlistButton movieId={movie.id} />
      </div>
    </div>
  );
}
