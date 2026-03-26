import { MovieList } from "types";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import AddTicketButton from "../ui/buttons/AddTicketButton";

interface MovieListCardProps {
  movie: MovieList;
  genres: string[];
}

export default function MovieListCard({ movie, genres }: MovieListCardProps) {
  return (
    <article className="mx-auto w-full max-w-md">
      <div className="flex h-32 flex-col overflow-hidden rounded-2xl border-b-2 border-dashed bg-white p-6 pt-4">
        {/* 제목 & 원제목 & 개봉년도 (줄 수 고정) */}
        <div className="min-w-0 shrink-0">
          <Link
            href={`/movie-details/${movie.id}`}
            className="block min-w-0 hover:text-gray-600"
          >
            <h1 className="line-clamp-2 text-lg leading-tight font-bold tracking-tight">
              {movie.title}
            </h1>
            <p className="line-clamp-1 text-xs tracking-tight text-gray-400">
              {`${movie.original_title} (${movie.release_date.split("-")[0]})`}
            </p>
          </Link>
        </div>

        {/* 장르 · 평점 (하단 고정, 장르는 최대 2줄) */}
        <div className="mt-auto flex shrink-0 items-center justify-between gap-2 pt-3">
          <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug text-gray-800">
            {genres.join(" · ")}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <FaStar className="text-accent-300 text-lg" />
            <p className="text-xl font-bold">
              {Math.round(movie.vote_average * 10) / 10 || 0}
            </p>
          </div>
        </div>
      </div>

      {/* 티켓 만들기 버튼 */}
      <AddTicketButton movieId={movie.id} />
    </article>
  );
}
