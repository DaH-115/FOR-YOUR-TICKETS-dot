import Link from "next/link";
import { Fragment } from "react";
import { CrewMember, MovieList } from "types";
import { FaStar } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import formatMovieDate from "@/utils/formatMovieDate";
import MovieCertification from "@/components/movie/MovieCertification";
import Tooltip from "@/components/ui/feedback/Tooltip";
import AddTicketButton from "@/components/ui/buttons/AddTicketButton";

interface MovieInfoCardProps {
  movie: MovieList;
  genres: string[];
  uniqueDirectors: CrewMember[];
}

export default function MovieInfoCard({
  movie,
  genres,
  uniqueDirectors,
}: MovieInfoCardProps) {
  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border-b-2 border-dashed bg-white p-8 pt-6">
        {/* 제목 & 원제목 & 개봉년도 */}
        <div className="flex items-start justify-between">
          <MovieCertification certification={movie.certification ?? null} />
          <Tooltip
            content={`${movie.title}(${movie.original_title}) 영화 상세정보 보기`}
          >
            <Link
              href={`/movie-details/${movie.id}`}
              aria-label={`${movie.title}(${movie.original_title}) 영화 상세정보 보기`}
              role="button"
              className="relative inline-block text-gray-300 transition-colors duration-300 ease-in-out hover:text-gray-500"
            >
              <IoInformationCircle className="h-8 w-8" aria-hidden />
            </Link>
          </Tooltip>
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
          <p className="text-lg tracking-tight text-gray-400">{`${movie.original_title} (${movie.release_date.split("-")[0]})`}</p>
        </div>

        {/* 장르 */}
        <p className="mb-16 space-x-2 text-lg text-gray-800">
          {genres.join(" · ")}
        </p>

        <div className="flex items-start justify-between gap-2 text-gray-800">
          {/* 개봉일, 한국 날짜 */}
          <p className="text-xs">{formatMovieDate(movie.release_date)}</p>
          {/* 감독 */}
          <ul className="text-xs">
            {uniqueDirectors.map((director) => (
              <Fragment key={director.id}>
                <li className="font-semibold">{director.name}</li>
                <li>{director.original_name}</li>
                <li className="mt-1">{director.job}</li>
              </Fragment>
            ))}
          </ul>

          {/* 평점 */}
          <div className="flex items-center gap-1">
            <FaStar className="text-accent-300 text-2xl" />
            <p className="text-2xl font-bold">
              {Math.round(movie.vote_average * 10) / 10 || 0}
            </p>
          </div>
        </div>
      </div>
      <AddTicketButton movieId={movie.id} />
    </section>
  );
}
