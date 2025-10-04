import { FaStar } from "react-icons/fa";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

interface TrendingMovieItemProps {
  movie: MovieList;
  rank: number;
  onMovieClick: (title: string) => void;
}

export default function TrendingMovieItem({
  movie,
  rank,
  onMovieClick,
}: TrendingMovieItemProps) {
  return (
    <button
      onClick={() => onMovieClick(movie.title)}
      className="group flex w-full items-center gap-6 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02]"
    >
      <span className="flex items-center justify-center text-white">
        {rank}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-base font-medium text-white group-hover:text-accent-300">
          {movie.title}
        </p>
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-400">
            <FaStar className="text-accent-300" size={12} />
          </p>
          <p className="text-xs text-gray-400">
            {movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : 0}
          </p>
          <span className="text-xs text-gray-500">•</span>
          <p className="text-xs text-gray-400">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "개봉년도 미상"}
          </p>
        </div>
      </div>
    </button>
  );
}
