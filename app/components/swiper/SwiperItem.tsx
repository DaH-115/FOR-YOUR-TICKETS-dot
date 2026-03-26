import MovieCertification from "@/components/movie/MovieCertification";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import MoviePoster from "@/components/movie/MoviePoster";
import MovieListCard from "@/components/movie/MovieListCard";

export default function SwiperItem({
  idx,
  movie,
}: {
  idx: number;
  movie: MovieList;
}) {
  const { original_title, poster_path, title, genres } = movie;
  const displayTitle = getEnrichMovieTitle(original_title, title);

  return (
    <article className="relative flex flex-col drop-shadow-xl">
      <header className="absolute top-0 left-0 z-50 flex w-full items-center justify-between rounded-t-2xl bg-linear-to-t from-transparent to-black/60 py-2 pr-2 pl-3 text-white">
        {/* 인덱스 */}
        <p className="text-2xl font-semibold">{idx + 1}</p>
        {/* 등급 */}
        <div className="flex shrink-0 items-start gap-2">
          <MovieCertification certification={movie.certification ?? null} />
        </div>
      </header>

      {/* 영화 포스터 */}
      <MoviePoster posterPath={poster_path} title={displayTitle} />
      {/* 영화 리스트 카드 */}
      <MovieListCard movie={movie} genres={genres || []} />
    </article>
  );
}
