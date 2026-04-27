import Link from "next/link";
import { CrewMember, MovieList } from "types";
import { FaStar } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import { formatMovieDate } from "@/utils/formatMovieDate";
import MovieCertification from "@/components/movie/MovieCertification";
import Tooltip from "@/components/ui/feedback/Tooltip";
import AddTicketButton from "@/components/ui/buttons/AddTicketButton";

interface MovieInfoCardProps {
  movie: MovieList;
  uniqueDirectors: CrewMember[];
}

export default function MovieInfoCard({
  movie,
  uniqueDirectors,
}: MovieInfoCardProps) {
  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border-b-2 border-dashed bg-white p-8 pt-6">
        {/* 인증등급 & 상세정보 버튼 */}
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

        {/* 제목 & 원제목 & 개봉년도 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{movie.title}</h1>
          <p className="text-lg tracking-tight text-gray-400">{`${movie.original_title} (${movie.release_date.split("-")[0]})`}</p>
        </div>

        <div className="flex items-start justify-between gap-2 text-sm text-gray-800">
          {/* 개봉일, 한국 날짜 */}
          <p>{formatMovieDate(movie.release_date)}</p>
          {/* 감독 */}
          <ul className="space-y-2">
            {uniqueDirectors.map((director) => {
              // 현지화된 이름과 원어 이름이 동일하면 중복이므로 하나만 표시한다.
              const hasDistinctOriginalName =
                !!director.original_name &&
                director.original_name !== director.name;

              return (
                <div key={director.id}>
                  <li className="font-semibold">{director.name}</li>
                  {hasDistinctOriginalName && <li>{director.original_name}</li>}
                  <li className="text-xs">{director.job}</li>
                </div>
              );
            })}
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
      <AddTicketButton movieId={movie.id} variant="large" />
    </section>
  );
}
