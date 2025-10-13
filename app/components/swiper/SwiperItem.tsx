import Link from "next/link";
import MovieCertification from "@/components/movie/MovieCertification";
import Tooltip from "@/components/ui/feedback/Tooltip";
import getEnrichMovieTitle from "@/utils/getEnrichMovieTitle";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { FaStar } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import WriteButton from "@/components/ui/buttons/WriteButton";
import MoviePoster from "@/components/movie/MoviePoster";
import GenreList from "@/components/movie/GenreList";

export default function SwiperItem({
  idx,
  movie,
}: {
  idx: number;
  movie: MovieList;
}) {
  const { id, original_title, poster_path, title, vote_average, release_date } =
    movie;
  const displayTitle = getEnrichMovieTitle(original_title, title);

  return (
    <article className="relative flex flex-col drop-shadow-xl">
      {/* 랭킹 번호 */}
      <header className="absolute left-0 top-0 z-50 flex w-full items-center rounded-t-xl bg-gradient-to-t from-transparent to-black/60 py-1 pl-3 pr-2 text-white">
        <p className="text-2xl font-semibold">{idx + 1}</p>
      </header>

      {/* 영화 포스터 */}
      <MoviePoster posterPath={poster_path} title={displayTitle} />

      {/* 영화 정보 카드 - 제목, 등급, 평점, 장르 */}
      <section className="mt-2 rounded-2xl bg-white">
        {/* 평점 & 등급 */}
        <div className="flex items-center justify-between px-2 pt-3">
          {/* 평점 */}
          <div className="flex items-center justify-center gap-1 rounded-full border border-gray-300 px-2 py-1">
            <FaStar className="text-sm text-accent-300" />
            <span className="text-sm font-semibold">
              {vote_average ? Math.round(vote_average * 10) / 10 : 0}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* 등급 */}
            <div className="hidden sm:block">
              <MovieCertification certification={movie.certification || null} />
            </div>

            {/* 인포 버튼 */}
            <div className="relative">
              <Link
                href={`/movie-details/${id}`}
                aria-label={`${displayTitle} 영화 상세정보 보기`}
              >
                <IoInformationCircle
                  className="text-xl text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-800"
                  aria-hidden
                />
              </Link>
              <Tooltip>{displayTitle} 영화 상세정보 보기</Tooltip>
            </div>
          </div>
        </div>

        {/* 영화 제목 */}
        <div className="p-3 pb-4">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex-1">
              <h3 className="line-clamp-1 text-base font-bold leading-tight tracking-tight">
                {title}
              </h3>
              <p className="line-clamp-1 text-xs leading-tight tracking-tight text-gray-500">
                {`${original_title} (${release_date.slice(0, 4)})`}
              </p>
            </div>
          </div>
        </div>

        {/* 장르 */}
        <div className="px-3 pb-4">
          <GenreList genres={movie.genres || []} />
        </div>
      </section>
      {/* 티켓 만들기 버튼 */}
      <WriteButton movieId={id} size="small" />
    </article>
  );
}
